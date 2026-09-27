/** Admin-only compatibility styles for the installed Tina 3.13 shell. */
export function installAdminStyles() {
  if (typeof document === 'undefined' || document.getElementById('openstack-admin-styles')) return;
  const style = document.createElement('style');
  style.id = 'openstack-admin-styles';
  style.textContent = `
.software-catalogue-panel {
  box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0;
  white-space: normal; overflow-wrap: anywhere;
  border: 1px solid #d5dce2; border-radius: 6px; background: #f5f8fb;
  padding: 16px; margin-bottom: 20px; font-size: 14px; line-height: 1.5;
}
.software-catalogue-panel h3 { font-size: 17px; font-weight: 600; margin: 0 0 12px; }
.software-catalogue-panel p { white-space: normal; margin: 0 0 12px; }
.software-catalogue-panel a { color: #126fa3; text-decoration: underline; }
.software-catalogue-panel button {
  display: block; max-width: 100%; white-space: normal; border: 1px solid #126fa3;
  border-radius: 4px; background: white; color: #126fa3; padding: 8px 12px;
  margin: 8px 0 12px; font-weight: 600; cursor: pointer;
}
.software-catalogue-panel button:disabled { opacity: .5; cursor: not-allowed; }
.software-catalogue-panel button:focus-visible { outline: 2px solid #126fa3; outline-offset: 2px; }
.software-catalogue-panel [role='alert'] { color: #a12622; }

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
