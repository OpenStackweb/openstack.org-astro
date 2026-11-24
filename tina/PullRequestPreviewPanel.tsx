import React, { useState } from 'react';
import { useCMS } from 'tinacms';
import { cmsResponse } from './cms-response.mjs';

type PullPreview = {
  number: number;
  title: string;
  source: string;
  head: string;
  base: string;
  branch?: string;
  files: string[];
  state: string;
  reason?: string;
  configured: boolean;
  accepted?: boolean;
  url?: string;
  pullUrl: string;
  workflowUrl: string;
};

export function PullRequestPreviewPanel() {
  const cms = useCMS();
  const [number, setNumber] = useState('');
  const [preview, setPreview] = useState<PullPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function request(method = 'GET') {
    setBusy(true);
    setError('');
    try {
      if (!cms.api.tina) throw Error('Tina is still loading. Try again.');
      const query = new URLSearchParams({ pr: number.trim() });
      if (method === 'POST' && preview) {
        query.set('head', preview.head);
        query.set('base', preview.base);
      }
      const response = await cms.api.tina.authProvider.fetchWithToken(
        `/api/cms/editorial-preview?${query}`,
        { method },
      );
      setPreview(
        (await cmsResponse(response, 'Unable to check this pull request.')) as PullPreview,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview request failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Preview a pull request"
      style={{ borderTop: '1px solid #d6dce3', marginTop: 32, paddingTop: 24 }}
    >
      <h2>Preview a pull request</h2>
      <p>
        Use this for a contributor’s fork or an internal PR. Inspect the changes, then explicitly
        request a preview. This does not merge the PR or change its source branch.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void request();
        }}
      >
        <label htmlFor="preview-pr-number">Pull request number</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          <input
            id="preview-pr-number"
            inputMode="numeric"
            pattern="[1-9][0-9]{0,6}"
            placeholder="57"
            value={number}
            disabled={busy}
            required
            onChange={(event) => {
              setNumber(event.target.value);
              setPreview(null);
              setError('');
            }}
          />
          <button type="submit" disabled={busy}>
            {busy ? 'Please wait…' : preview ? 'Check PR status' : 'Inspect PR'}
          </button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      {preview && (
        <>
          <h3 style={{ fontWeight: 600, marginTop: 20 }}>
            #{preview.number}: {preview.title}
          </h3>
          <p>
            {preview.source} · Revision <code>{preview.head?.slice(0, 12)}</code>
          </p>
          <details>
            <summary>{preview.files.length} changed files</summary>
            <ul>
              {preview.files.map((path) => (
                <li key={path} style={{ overflowWrap: 'anywhere' }}>
                  {path}
                </li>
              ))}
            </ul>
          </details>
          {preview.reason && <p role="alert">{preview.reason}</p>}
          <p role="status">
            {preview.accepted
              ? 'Preview requested. Check PR status after the build finishes.'
              : preview.state === 'ready'
                ? 'The preview is ready for this PR revision and main branch.'
                : preview.state === 'failed'
                  ? 'The build failed. Check build history, fix the reported issue, then request another preview.'
                  : preview.state === 'pending'
                    ? 'A preview is not ready yet. Check the build history for progress.'
                    : preview.state === 'not_requested'
                      ? 'No preview has been prepared for this PR revision and main branch.'
                      : ''}
          </p>
          {!preview.configured && (
            <p>The preview workflow connection needs to be configured by a site maintainer.</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '20px 0' }}>
            <a href={preview.pullUrl} target="_blank" rel="noopener noreferrer">
              Review PR changes ↗
            </a>
            {preview.configured &&
              ['not_requested', 'failed', 'pending'].includes(preview.state) && (
                <button
                  type="button"
                  disabled={busy || preview.accepted}
                  onClick={() => void request('POST')}
                >
                  Preview PR #{preview.number}
                </button>
              )}
            {preview.state === 'ready' && preview.url && (
              <a href={preview.url} target="_blank" rel="noopener noreferrer">
                Open PR preview ↗
              </a>
            )}
            <a href={preview.workflowUrl} target="_blank" rel="noopener noreferrer">
              Preparation history ↗
            </a>
          </div>
        </>
      )}
      <p>
        Automatic preparation accepts editorial JSON content only. Code, dependency, workflow and
        asset changes require a maintainer-prepared preview.
      </p>
    </section>
  );
}
