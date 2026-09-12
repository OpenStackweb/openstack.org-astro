// Desktop hover enhances native details controls; touch and keyboard keep their native behavior.
export function hoverMenu(node) {
  let hovering = false,
    closeTimer;
  const cancel = () => clearTimeout(closeTimer);
  const enter = (event) => {
    if (
      event.pointerType !== 'mouse' ||
      !matchMedia('(min-width: 1001px) and (hover: hover) and (pointer: fine)').matches
    )
      return;
    cancel();
    hovering = true;
    node.open = true;
  };
  const leave = () => {
    if (!hovering) return;
    hovering = false;
    cancel();
    closeTimer = setTimeout(() => {
      if (!node.contains(document.activeElement)) node.open = false;
    }, 120);
  };
  const blur = (event) => {
    if (!hovering && !node.contains(event.relatedTarget)) node.open = false;
  };
  const escape = (event) => {
    if (event.key === 'Escape' && node.open) {
      cancel();
      node.open = false;
      node.querySelector('summary')?.focus();
      event.stopPropagation();
    }
  };
  node.addEventListener('pointerenter', enter);
  node.addEventListener('pointerleave', leave);
  node.addEventListener('focusout', blur);
  node.addEventListener('keydown', escape);
  return {
    destroy() {
      cancel();
      node.removeEventListener('pointerenter', enter);
      node.removeEventListener('pointerleave', leave);
      node.removeEventListener('focusout', blur);
      node.removeEventListener('keydown', escape);
    },
  };
}
