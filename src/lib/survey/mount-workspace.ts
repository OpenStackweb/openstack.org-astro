import { surveyAssets } from './manifest.mjs';
import { MOUNT } from './paths.mjs';

type Workspace = 'participant' | 'staff' | 'analytics';
const workspaces = {
  analytics: {
    manifest: 'analytics-manifest',
    denied: null,
    mount: 'mountAnalytics',
    failure: 'Survey analytics is temporarily unavailable. Please try again later.',
  },
  participant: {
    manifest: 'manifest',
    denied: null,
    mount: 'mountParticipant',
    failure: 'The survey workspace is temporarily unavailable. Please try again later.',
  },
  staff: {
    manifest: 'staff-manifest',
    denied: {
      message: 'Sign in with OpenInfraID to continue to the staff workspace.',
      href: MOUNT + '/auth/login?workspace=staff',
      label: 'Sign in to staff workspace',
      forbidden: 'You are signed in, but this account does not have Survey reviewer access.',
    },
    mount: 'mountStaff',
    failure: 'Questionnaire review is temporarily unavailable. Please try again later.',
  },
} as const;

function createAlert(message: string): HTMLParagraphElement {
  const paragraph = document.createElement('p');
  paragraph.setAttribute('role', 'alert');
  paragraph.textContent = message;
  return paragraph;
}

function loadStylesheet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject(Error('Styles unavailable'));
    document.head.appendChild(link);
  });
}

/** Load the service-owned UI through Astro's same-origin survey gateway. */
export async function mountSurveyWorkspace(root: HTMLElement, workspace: Workspace) {
  const config = workspaces[workspace];
  try {
    const response = await fetch(MOUNT + '/embed/' + config.manifest, {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (config.denied && [401, 403].includes(response.status)) {
      const link = document.createElement('a');
      link.href = config.denied.href;
      link.className = 'button survey-sign-in';
      link.textContent = response.status === 403 ? 'Use another account' : config.denied.label;
      const notice = document.createElement('div');
      notice.className = 'survey-sign-in-notice';
      notice.replaceChildren(
        createAlert(response.status === 403 ? config.denied.forbidden : config.denied.message),
        link,
      );
      root.replaceChildren(notice);
      return;
    }
    if (!response.ok) throw Error('Unavailable');
    // Validate the entire manifest before adding assets to the document.
    const assets = surveyAssets(await response.json());
    await Promise.all(assets.styles.map(loadStylesheet));
    const entry = await import(/* @vite-ignore */ assets.script);
    entry[config.mount](root);
  } catch {
    root.replaceChildren(createAlert(config.failure));
  }
}
