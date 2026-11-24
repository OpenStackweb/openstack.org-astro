import { PullRequestPreviewPanel } from './PullRequestPreviewPanel';
import React, { useEffect, useRef, useState } from 'react';
import { useCMS } from 'tinacms';
import { cmsResponse } from './cms-response.mjs';

type PreviewStatus = {
  state: string;
  branches?: string[];
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
  const [branchInput, setBranchInput] = useState(currentBranch);
  const [branches, setBranches] = useState<string[]>([]);
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
          setBranchInput(next);
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
      if (result.branches) setBranches(result.branches);
      setMessage(
        result.accepted
          ? 'Build requested. It can take a few minutes. Check status for the preview link.'
          : result.state === 'ready'
            ? 'The latest saved revision is ready to preview.'
            : result.state === 'main'
              ? 'Choose an editorial branch below to build a preview.'
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
    <section
      className="editorial-preview-panel"
      style={{ padding: 32, maxWidth: 760 }}
      aria-label="Editorial preview"
    >
      <style>{`.editorial-preview-panel h2{font-size:24px;font-weight:600;margin-bottom:16px}.editorial-preview-panel p{margin:12px 0;line-height:1.6}.editorial-preview-panel input,.editorial-preview-panel select{border:1px solid #aab4c2;padding:10px;border-radius:5px;max-width:100%;background:white}.editorial-preview-panel button,.editorial-preview-panel a{border:1px solid #00558a;border-radius:5px;padding:10px 16px;color:#00558a;font-weight:600}.editorial-preview-panel button{cursor:pointer}.editorial-preview-panel button:disabled{opacity:.5;cursor:wait}.editorial-preview-panel button:focus-visible,.editorial-preview-panel a:focus-visible,.editorial-preview-panel input:focus-visible,.editorial-preview-panel select:focus-visible{outline:3px solid #e91943;outline-offset:3px}.editorial-preview-panel [role=alert]{color:#a41624}`}</style>
      <h2>Editorial preview</h2>
      <p>
        Branch: <strong>{branch}</strong>
      </p>
      <p>
        Save your changes in Tina first. Build a preview when you are ready to review them. Saving
        content and opening a pull request do not start a preview build.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = branchInput.trim();
          if (!next) return;
          if (next === branch) {
            void check();
            return;
          }
          selectedBranch.current = next;
          setBranch(next);
          setStatus(null);
          setMessage('');
          setError('');
        }}
      >
        <label htmlFor="preview-branch">Branch to preview</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          <input
            id="preview-branch"
            list="preview-branches"
            value={branchInput}
            onChange={(event) => setBranchInput(event.target.value)}
            required
          />
          <datalist id="preview-branches">
            {branches.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <button type="submit" disabled={busy}>
            Select branch
          </button>
        </div>
        <p>This selects a preview only; it does not change the branch you are editing.</p>
      </form>
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
      <PullRequestPreviewPanel />
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
