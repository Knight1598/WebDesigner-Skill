const menuList = document.getElementById('menu-list');
const modal = document.getElementById('preorder-modal');
let lastFocus = null;

function renderMenu(filter) {
  const items = window.MOCK_MENU.filter(i => filter === 'all' || i.category === filter);
  menuList.innerHTML = items.length
    ? items.map(i => `<li><span class="${i.soldOut ? 'soldout' : ''}">${i.name}${i.soldOut ? ' (หมดแล้ว)' : ''}</span><span class="price">${i.price} บาท</span></li>`).join('')
    : '<li class="empty">วันนี้หมวดนี้หมดแล้ว</li>';
}

function openModal() {
  lastFocus = document.activeElement;
  modal.hidden = false;
  modal.querySelector('input').focus();
}
function closeModal() {
  modal.hidden = true;
  if (lastFocus) lastFocus.focus();
}

const handlers = {
  toggle_mobile_nav: el => {
    const open = el.getAttribute('aria-expanded') !== 'true';
    el.setAttribute('aria-expanded', String(open));
    document.getElementById('site-nav').classList.toggle('open', open);
  },
  filter_menu: el => {
    el.parentElement.querySelectorAll('[role="tab"]').forEach(t => t.setAttribute('aria-selected', String(t === el)));
    renderMenu(el.dataset.filter);
  },
  open_preorder: openModal,
  submit_preorder: async (form, e) => {
    e.preventDefault();
    const status = form.querySelector('.form-status');
    if (!form.reportValidity()) return;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'กำลังส่ง…';
    await new Promise(r => setTimeout(r, 900));
    btn.disabled = false; btn.textContent = 'ส่งคำสั่งจอง';
    if (form.demo_error.checked) {
      status.dataset.state = 'error';
      status.textContent = 'ส่งไม่สำเร็จ ลองอีกครั้ง หรือโทร 02-000-0000';
    } else {
      status.dataset.state = 'success';
      status.textContent = `รับคำสั่งจองของคุณ${form.name.value}แล้ว มารับวันที่ ${form.pickup_date.value}`;
    }
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && el.tagName !== 'FORM' && handlers[el.dataset.action]) handlers[el.dataset.action](el, e);
  if (e.target.closest('.modal-close') || e.target === modal) closeModal();
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-action]');
  if (f && handlers[f.dataset.action]) handlers[f.dataset.action](f, e);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

renderMenu('all');
