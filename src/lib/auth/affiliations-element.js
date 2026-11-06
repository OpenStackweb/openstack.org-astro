import { affiliationPayload, localToday } from './affiliations.mjs';
class MemberAffiliations extends HTMLElement {
  generation = 0;
  unsubscribe;
  connectedCallback() {
    this.disconnectedCallback();
    this.hidden = true;
    const generation = this.generation;
    const clientId = this.closest('member-profile')?.dataset.clientId;
    if (!clientId) return;
    return import('./client.js')
      .then((auth) => {
        if (!this.isConnected || generation !== this.generation) return;
        // This child can upgrade before the parent/header has configured auth.
        auth.configureAuth({
          origin: location.origin,
          clientId,
          deployment: this.closest('member-profile')?.dataset.authDeployment,
        });
        let memberId;
        this.unsubscribe = auth.subscribe((state) => {
          if (state.status !== 'authenticated') {
            memberId = undefined;
            this.generation++;
            this.replaceChildren();
            this.hidden = true;
          } else if (memberId !== state.member.id) {
            memberId = state.member.id;
            this.generation++;
            this.hidden = false;
            this.setup(auth);
          }
        });
      })
      .catch(() => {
        if (this.isConnected && generation === this.generation) {
          this.hidden = false;
          this.textContent = 'Affiliations could not be loaded. Please reload the page.';
        }
      });
  }
  disconnectedCallback() {
    this.generation++;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.replaceChildren();
  }
  setup(auth) {
    this.replaceChildren();
    const generation = this.generation;
    const valid = () => this.isConnected && generation === this.generation;
    const el = (tag, text, parent = this) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      parent.append(node);
      return node;
    };
    el('h2', 'My affiliations');
    el(
      'p',
      'Manage your organizations and affiliation history. Saving your organization in the User Survey also adds a current affiliation.',
    );
    const status = el('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const signIn = el('a', 'Sign in again to allow affiliation editing');
    signIn.href = '/auth/login?back=%2Fprofile%2F';
    signIn.hidden = true;
    const reload = el('button', 'Reload affiliations');
    reload.type = 'button';
    const list = el('div');
    const editor = el('div');
    const iso = (epoch) =>
      typeof epoch === 'number' && Number.isFinite(epoch)
        ? new Date(epoch * 1000).toISOString().slice(0, 10)
        : '';
    let busy = false;
    const controls = (disabled) => {
      for (const control of this.querySelectorAll('button, input')) control.disabled = disabled;
    };
    const form = (item) => {
      editor.replaceChildren();
      el('h3', item ? 'Edit affiliation' : 'Add affiliation', editor);
      const form = el('form', '', editor);
      const input = (name, title, type, value) => {
        const label = el('label', title + ' ', form);
        const field = el('input', '', label);
        field.name = name;
        field.type = type;
        if (type === 'checkbox') field.checked = !!value;
        else field.value = value || '';
        if (type === 'text') field.maxLength = 255;
        field.required = ['organization', 'start_date'].includes(name);
        return field;
      };
      input('organization', 'Organization', 'text', item?.organization);
      input('job_title', 'Job title (optional)', 'text', item?.job_title);
      input('start_date', 'Start date', 'date', iso(item?.start_date) || localToday());
      const current = input(
        'is_current',
        'Current affiliation',
        'checkbox',
        item ? item.is_current : true,
      );
      const end = input('end_date', 'End date', 'date', iso(item?.end_date));
      const updateEnd = () => {
        end.parentElement.hidden = current.checked;
        end.required = !current.checked;
      };
      current.addEventListener('change', updateEnd);
      updateEnd();
      const submit = el('button', item ? 'Save affiliation' : 'Add affiliation', form);
      submit.type = 'submit';
      if (item) {
        const cancel = el('button', 'Cancel editing', form);
        cancel.type = 'button';
        cancel.onclick = () => formReset();
      }
      form.onsubmit = async (event) => {
        event.preventDefault();
        if (busy) return;
        let payload;
        try {
          payload = affiliationPayload(new FormData(form));
        } catch (error) {
          status.textContent = error.message;
          return;
        }
        await mutate({ method: item ? 'PUT' : 'POST', ...(item ? { id: item.id } : {}), payload });
      };
    };
    const formReset = () => form(null);
    const load = async () => {
      status.textContent = 'Loading affiliations…';
      list.replaceChildren();
      const items = await auth.memberAffiliations();
      if (!valid()) return;
      status.textContent = items.length ? '' : 'You have no affiliations yet.';
      for (const item of items) {
        const article = el('article', '', list);
        el('h3', item.organization, article);
        el(
          'p',
          [
            item.job_title,
            iso(item.start_date) +
              ' – ' +
              (item.is_current ? 'Present' : iso(item.end_date) || 'End date not provided'),
          ]
            .filter(Boolean)
            .join(' · '),
          article,
        );
        const edit = el('button', 'Edit', article);
        edit.type = 'button';
        edit.onclick = () => {
          form(item);
          editor.querySelector('input')?.focus();
        };
        const remove = el('button', 'Delete', article);
        remove.type = 'button';
        remove.onclick = () => {
          if (!busy && window.confirm('Delete this affiliation from your member profile?'))
            void mutate({ method: 'DELETE', id: item.id });
        };
      }
    };
    const mutate = async (options) => {
      if (busy) return;
      busy = true;
      controls(true);
      status.textContent = 'Saving affiliation…';
      try {
        await auth.memberAffiliations(options);
        if (!valid()) return;
        formReset();
        await load();
        if (valid()) status.textContent = 'Your affiliations have been updated.';
      } catch (error) {
        if (valid()) {
          status.textContent =
            error.message || 'Affiliations could not be updated. Please reload before retrying.';
          signIn.hidden = error.name !== 'AffiliationConsentRequired';
        }
      } finally {
        if (valid()) {
          busy = false;
          controls(false);
        }
      }
    };
    const refresh = async () => {
      if (busy) return;
      busy = true;
      controls(true);
      try {
        await load();
      } catch (error) {
        if (valid()) {
          status.textContent = error.message || 'Affiliations could not be loaded.';
          signIn.hidden = error.name !== 'AffiliationConsentRequired';
        }
      } finally {
        if (valid()) {
          busy = false;
          controls(false);
        }
      }
    };
    reload.onclick = refresh;
    formReset();
    void refresh();
  }
}
if (!customElements.get('member-affiliations'))
  customElements.define('member-affiliations', MemberAffiliations);
