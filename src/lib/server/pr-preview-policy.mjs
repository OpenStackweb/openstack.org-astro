export const previewRepository = 'OpenStackweb/openstack.org-astro';
export const prPreviewWorkflow = 'prepare-pr-preview.yml';
export const prPreviewWorkflowUrl = `https://github.com/${previewRepository}/actions/workflows/${prPreviewWorkflow}`;
export const validRevision = (value) => /^[a-f0-9]{40}$/.test(value || '');
export const validPullNumber = (value) => /^[1-9][0-9]{0,6}$/.test(String(value));

/** Only non-executable editorial data may enter an automatically prepared fork preview. */
export function previewContentPath(path) {
  return (
    typeof path === 'string' &&
    !path.split('/').some((part) => part === '.' || part === '..') &&
    (/^src\/lib\/content\/[A-Za-z0-9_/-]+\.json$/.test(path) ||
      path === 'src/lib/community/members.json')
  );
}

export function assessPreviewPull(pull, files) {
  if (pull?.state !== 'open' || pull.merged) return 'This pull request is no longer open.';
  if (pull.base?.repo?.full_name !== previewRepository || pull.base.ref !== 'main')
    return 'Only pull requests targeting this website’s main branch can be previewed here.';
  if (!validRevision(pull.head?.sha)) return 'The pull request revision is unavailable.';
  if (
    !Array.isArray(files) ||
    !files.length ||
    files.length !== pull.changed_files ||
    files.length > 100
  )
    return 'The complete change list could not be verified (maximum 100 files).';
  if (
    files.some(
      (file) =>
        !previewContentPath(file.filename) ||
        (file.previous_filename && !previewContentPath(file.previous_filename)),
    )
  )
    return 'This PR changes code, assets or configuration. A maintainer must prepare its preview manually; automatic fork previews accept editorial JSON content only.';
  return null;
}

export function pullPreviewBranch(number, head, base) {
  if (!validPullNumber(number) || !validRevision(head) || !validRevision(base))
    throw Error('Invalid preview identity');
  return `review/pr-${number}-${head.slice(0, 12)}-${base.slice(0, 12)}`;
}
