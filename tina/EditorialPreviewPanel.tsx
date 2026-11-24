import React, { useEffect, useRef, useState } from 'react';
import { useCMS } from 'tinacms';
import { cmsResponse } from './cms-response.mjs';

type PreviewStatus = {
  state: string;
  configured: boolean;
  sha?: string;
  url?: string;
  accepted?: boolean;
  workflowUrl: string;
};

export function EditorialPreviewPanel() {
  const cms = useCMS();
  const currentBranch = () => decodeURIComponent(cms.api.tina?.branch || 'main');
  const [branch, setBranch] = useState(currentBranch);
  const selectedBranch = useRef(branch);
  const [status, setStatus] = useState<PreviewStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(
    () =>
      cms.events.subscribe('branch:change', () => {
        // Tina updates its API client in response to the same event.
        queueMicrotask(() => {
          const next = currentBranch();
          selectedBranch.current = next;
          setBranch(next);
          setStatus(null);
          setMessage('');
          setError('');
          setBusy(false);
        });
      }),
    [cms],
  );

  async function check(method = 'GET') {
    const requestedBranch = branch;
    setBusy(true);
    setError('');
    try {
      if (!cms.api.tina) throw new Error('Tina is still loading. Try Check status again.');
      const response = await cms.api.tina.authProvider.fetchWithToken(
        `/api/cms/editorial-preview?branch=${encodeURIComponent(requestedBranch)}`,
        { method },
      );
      const result = (await cmsResponse(response, 'Unable to check the preview.')) as PreviewStatus;
      if (selectedBranch.current !== requestedBranch) return;
      setStatus(result);
      setMessage(
        result.accepted
          ? 'Build requested. It can take a few minutes. Check status for the preview link.'
          : result.state === 'ready'
            ? 'The latest saved revision is ready to preview.'
            : result.state === 'main'
              ? 'Choose an editorial branch in Tina to build a preview.'
              : result.state === 'pending'
                ? 'No completed preview is available for this revision. Check the build history if a build was already requested.'
                : result.state === 'failed'
                  ? 'The preview build failed. Check the build history before retrying.'
                  : 'The branch or preview status is unavailable. Check your selected branch and try again.',
      );
    } catch (e) {
      if (selectedBranch.current === requestedBranch)
        setError(e instanceof Error ? e.message : 'Preview request failed.');
    } finally {
      if (selectedBranch.current === requestedBranch) setBusy(false);
    }
  }

  useEffect(() => {
    void check();
  }, [branch]);
  return (
    <section style={{ padding: 24, maxWidth: 720 }} aria-label="Editorial preview">
      <h2>Editorial preview</h2>
      <p>
        Branch: <strong>{branch}</strong>
      </p>
      <p>
        Save your changes in Tina first. Build a preview when you are ready to review them. Saving
        content and opening a pull request do not start a preview build.
      </p>
      {status?.sha && (
        <p>
          Saved revision: <code>{status.sha.slice(0, 12)}</code>
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
      {status && !status.configured && branch !== 'main' && (
        <p>
          Preview builds are not connected yet. A site maintainer needs to configure the connection.
        </p>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          margin: '20px 0',
        }}
      >
        <button type="button" disabled={busy} onClick={() => void check()}>
          {busy ? 'Please wait…' : 'Check status'}
        </button>
        {branch !== 'main' &&
          status?.configured &&
          ['pending', 'failed'].includes(status.state) && (
            <button
              type="button"
              disabled={busy || status.accepted}
              onClick={() => void check('POST')}
            >
              Build preview
            </button>
          )}
        {status?.state === 'ready' && status.url && (
          <a href={status.url} target="_blank" rel="noopener noreferrer">
            Open preview ↗
          </a>
        )}
        {status?.workflowUrl && (
          <a href={status.workflowUrl} target="_blank" rel="noopener noreferrer">
            Build history ↗
          </a>
        )}
      </div>
      <p>
        Previews are protected and do not publish anything. If you save more changes, request
        another preview when you want to review the new revision.
      </p>
    </section>
  );
}

export function PreviewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4m-2-13 5 3-5 3z" />
    </svg>
  );
}
