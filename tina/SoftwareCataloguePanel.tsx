import React, { useEffect, useState } from 'react';
import { useCMS } from 'tinacms';
import { cmsResponse } from './cms-response.mjs';

type Status = {
  configured: boolean;
  published: { release: string; refreshedAt: string | null; source: string };
  workflowUrl: string;
  pullRequestsUrl: string;
  running?: boolean;
  pending?: { number: number; url: string; preview: string } | null;
  latest?: { status: string; conclusion: string | null; createdAt: string; url: string } | null;
};

export function SoftwareCataloguePanel() {
  const cms = useCMS();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function request(method = 'GET') {
    if (!cms.api.tina) throw new Error('Tina is still loading. Try Check status again.');
    const response = await cms.api.tina.authProvider.fetchWithToken('/api/cms/software-refresh', {
      method,
    });
    return cmsResponse(response, 'Catalogue refresh request failed.') as Promise<Status>;
  }
  async function load() {
    setBusy(true);
    setError('');
    try {
      setStatus(await request());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load status.');
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function refresh() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await request('POST');
      setMessage(
        'Refresh requested. Check status shortly for the run and review pull request. Nothing is published until the pull request is merged.',
      );
      setStatus((current) => (current ? { ...current, running: true } : current));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Software catalogue refresh" className="software-catalogue-panel">
      <h3>Software catalogue</h3>
      <p>
        Fetch a candidate from the Software API for review. This does not publish it or change
        announcement pages.
      </p>
      {status && (
        <>
          <p>
            <strong>Published catalogue:</strong> {status.published.release}
          </p>
          <p>
            <strong>Snapshot refreshed:</strong>{' '}
            {status.published.refreshedAt
              ? new Date(status.published.refreshedAt).toLocaleString()
              : 'Not recorded for the existing snapshot'}
          </p>
          <p>
            <strong>Source:</strong> {status.published.source}
          </p>
          {!status.configured && (
            <p>
              The refresh connection needs administrator setup. Ordinary website publishing remains
              available.
            </p>
          )}
          {status.latest && (
            <p>
              Last request:{' '}
              <a href={status.latest.url} target="_blank" rel="noreferrer">
                {status.latest.conclusion || status.latest.status}
              </a>
            </p>
          )}
          {status.running && <p>A refresh is queued or running.</p>}
          {status.pending && (
            <p>
              Awaiting review:{' '}
              <a href={status.pending.url} target="_blank" rel="noreferrer">
                Pull request #{status.pending.number}
              </a>{' '}
              ·{' '}
              <a href={status.pending.preview} target="_blank" rel="noreferrer">
                Open preview
              </a>
            </p>
          )}
          <button
            type="button"
            disabled={busy || !status.configured || status.running || Boolean(status.pending)}
            onClick={refresh}
          >
            Refresh software catalogue
          </button>
          <p>
            <a href={status.workflowUrl} target="_blank" rel="noreferrer">
              Refresh run history
            </a>{' '}
            ·{' '}
            <a href={status.pullRequestsUrl} target="_blank" rel="noreferrer">
              Catalogue updates
            </a>
          </p>
        </>
      )}
      <button type="button" disabled={busy} onClick={load}>
        {busy ? 'Working…' : 'Check status'}
      </button>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
