import { surveyAssets } from './manifest.mjs';

type Workspace = 'participant' | 'staff';
const workspaces = {
  participant: {
    manifest: 'manifest',
    mount: 'mountParticipant',
    failure: 'The survey workspace is temporarily unavailable. Please try again later.',
  },
  staff: {
    manifest: 'staff-manifest',
    mount: 'mountStaff',
    failure: 'Questionnaire review is temporarily unavailable. Please try again later.',
  },
} as const;

function alert(message: string): HTMLParagraphElement {
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
    const response = await fetch('/user-survey/service/embed/' + config.manifest, {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (workspace === 'staff' && response.status === 403) {
      const link = document.createElement('a');
      link.href = '/user-survey/';
      link.textContent = 'Open the survey sign-in';
      root.replaceChildren(
        alert(
          'Survey reviewer access is required. Sign in through the survey, then return to this page.',
        ),
        link,
      );
      return;
    }
    if (!response.ok) throw Error('Unavailable');
    // Validate the entire manifest before adding assets to the document.
    const assets = surveyAssets(await response.json());
    await Promise.all(assets.styles.map(loadStylesheet));
    const entry = await import(/* @vite-ignore */ assets.script);
    entry[config.mount](root);
  } catch {
    root.replaceChildren(alert(config.failure));
  }
}
