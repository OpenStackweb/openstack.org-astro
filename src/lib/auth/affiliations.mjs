import { independentFetch } from '../network/upstream.mjs';
const endpoint = 'https://oifapi.openinfra.dev/api/v1/members/me/affiliations';

// Token and identity generation are checked before sending and after every await.
export async function requestAffiliations({
  session,
  accessToken,
  clearSession,
  method = 'GET',
  id,
  payload,
  fetcher = fetch,
}) {
  if (
    !['GET', 'POST', 'PUT', 'DELETE'].includes(method) ||
    (['PUT', 'DELETE'].includes(method) && (!Number.isSafeInteger(id) || id <= 0)) ||
    (['GET', 'POST'].includes(method) && id !== undefined)
  )
    throw Error('Invalid affiliation request.');
  const generation = session.epoch();
  const token = await accessToken();
  const assertCurrent = () => {
    if (session.epoch() !== generation || session.current()?.accessToken !== token)
      throw Error('Your session changed. Please retry.');
  };
  assertCurrent();
  const response = await independentFetch(
    endpoint + (id ? '/' + id : '') + (method === 'GET' ? '?expand=organization' : ''),
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    },
    fetcher,
  );
  assertCurrent();
  if (response.status === 401) {
    clearSession();
    throw Error('Your session has expired. Please sign in again.');
  }
  if (response.status === 403) {
    const error = Error('Please sign in again to allow affiliation editing.');
    error.name = 'AffiliationConsentRequired';
    throw error;
  }
  if (!response.ok)
    throw Error(
      'The affiliation request could not be completed. Reload your affiliations before retrying.',
    );
  if (method !== 'GET') return;
  const data = await response.json();
  assertCurrent();
  if (!Array.isArray(data?.data) || data.total !== data.data.length || data.data.length > 2000)
    throw Error('Your affiliations could not be loaded completely. Please retry.');
  return data.data.map((item) => {
    if (
      !Number.isSafeInteger(item.id) ||
      item.id <= 0 ||
      typeof item.organization?.name !== 'string'
    )
      throw Error('Your affiliations could not be loaded. Please retry.');
    return {
      id: item.id,
      organization: item.organization.name,
      job_title: typeof item.job_title === 'string' ? item.job_title : '',
      is_current: item.is_current === true,
      start_date: item.start_date,
      end_date: item.end_date,
    };
  });
}

export function affiliationPayload(form) {
  const organization_name = String(form.get('organization') || '').trim();
  const job_title = String(form.get('job_title') || '').trim();
  const is_current = form.get('is_current') === 'on';
  const date = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('Enter a valid date.');
    const ms = Date.parse(value + 'T00:00:00Z');
    if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value)
      throw Error('Enter a valid date.');
    return ms / 1000;
  };
  if (!organization_name || organization_name.length > 255 || job_title.length > 255)
    throw Error('Enter an organization and use at most 255 characters per field.');
  const start_date = date(String(form.get('start_date') || ''));
  const end_date = is_current ? null : date(String(form.get('end_date') || ''));
  if (end_date !== null && end_date <= start_date)
    throw Error('End date must be after start date.');
  return {
    organization_name,
    job_title,
    is_current,
    start_date,
    ...(end_date !== null ? { end_date } : {}),
  };
}
