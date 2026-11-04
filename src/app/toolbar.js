// Keep the child's everyday actions visible and secondary tools together.
const toolbar = document.querySelector('.top-actions');
if (toolbar) {
  const more = document.createElement('details');
  more.className = 'toolbar-more';
  more.innerHTML = '<summary aria-label="Mở thêm công cụ">☰<span>Thêm</span></summary><div class="toolbar-more-panel" aria-label="Công cụ khác"></div>';
  const panel = more.querySelector('.toolbar-more-panel');
  for (const id of ['btn-select-character', 'btn-open-maze', 'btn-manage-questions', 'btn-toggle-coords']) {
    const button = document.getElementById(id);
    if (button) panel.append(button);
  }
  toolbar.append(more);
  const close = () => { more.open = false; };
  panel.addEventListener('click', e => { if (e.target.closest('button')) close(); });
  document.addEventListener('click', e => { if (!more.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && more.open) { close(); more.querySelector('summary').focus(); } });
}
