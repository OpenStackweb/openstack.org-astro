/** Admin-only compatibility styles for the installed Tina 3.13 shell. */
export function installAdminStyles() {
  if (typeof document === 'undefined' || document.getElementById('openstack-admin-styles')) return;
  const style = document.createElement('style');
  style.id = 'openstack-admin-styles';
  style.textContent = `
/* Tina 3.13 reserves a 440px preview beside the editing panel. Below that
   width its negative displacement is rejected, leaving desktop padding behind.
   Phones use an overlay instead; this stylesheet is loaded only by the admin. */
@media (max-width: 440px) {
  body {
    padding-left: 0 !important;
  }

  /* The closed-panel trigger sits outside the sidebar. Remove it from layout
     while Tina makes it inert, so the invisible control cannot widen the page. */
  button[aria-label='Show editing panel'].pointer-events-none {
    display: none !important;
  }

  /* Tina's inline 360px minimum must also yield on smaller phones. */
  .fixed.z-base > .relative.h-dvh {
    min-width: 0 !important;
  }
}
`;
  document.head.appendChild(style);
}
