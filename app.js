(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem('appz-theme'); } catch {}
  const preferred = preference === 'dark' || preference === 'light' ? preference : null;
  function apply(theme) {
    root.dataset.theme = theme;
    const label = window.appzText(theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    const button = document.querySelector('.theme-toggle');
    if (button) { button.setAttribute('aria-label', label); button.title = label; }
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0c1017' : '#f1f2f4';
  }
  window.addEventListener('appzlanguagechange', () => apply(root.dataset.theme));
  apply(preferred || (systemTheme.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelector('.theme-toggle').addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem('appz-theme', preference); } catch {}
    });
  });
  systemTheme.addEventListener('change', event => {
    if (preference !== 'dark' && preference !== 'light') apply(event.matches ? 'dark' : 'light');
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.carousel');
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  const pause = carousel.querySelector('.carousel-pause');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = dots.length;
  const slidesCount = carousel.querySelector('.carousel-count');
  // Duplicates allow the last image to continue leftward into the first.
  const first = track.firstElementChild.cloneNode(true);
  const last = track.lastElementChild.cloneNode(true);
  for (const clone of [first, last]) { clone.setAttribute('aria-hidden', 'true'); clone.removeAttribute('role'); }
  track.prepend(last); track.append(first);
  let index = 1, busy = false, timer, paused = reducedMotion.matches, hovered = false, focused = false, drag = null;
  function paint(animate = true, offset = 0) {
    track.style.transition = animate && !reducedMotion.matches ? '' : 'none';
    track.style.transform = `translateX(calc(${-index * 100}% + ${offset}px))`;
    const current = (index - 1 + total) % total;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    [...track.children].forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.setAttribute('aria-label', window.appzEnglish() ? `${((i - 1 + total) % total) + 1} of ${total}` : `${((i - 1 + total) % total) + 1} de ${total}`);
      const image = slide.querySelector('img');
      image.alt = window.appzText(image.alt);
    });
    slidesCount.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovered && !focused && !document.hidden && !drag) timer = setTimeout(() => move(index + 1), 5000);
  }
  function settle() {
    if (index === total + 1) { index = 1; paint(false); }
    else if (index === 0) { index = total; paint(false); }
    busy = false; schedule();
  }
  function move(next) {
    if (busy) return;
    if (next === index) { schedule(); return; }
    clearTimeout(timer); index = next; busy = true; paint();
    if (reducedMotion.matches) settle();
  }
  track.addEventListener('transitionend', event => { if (event.target === track && event.propertyName === 'transform') settle(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => move(i + 1)));
  function pauseLabel() { pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', window.appzText(paused ? 'Iniciar apresentação' : 'Pausar apresentação')); }
  pause.addEventListener('click', () => { paused = !paused; pauseLabel(); schedule(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => { if (event.matches) { paused = true; settle(); pauseLabel(); } });
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(index + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  viewport.addEventListener('pointerdown', event => {
    if (busy || !event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: 0 };
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('dragging'); schedule();
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    drag.offset = event.clientX - drag.x; paint(false, drag.offset);
  });
  function finishDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const offset = drag.offset, vertical = Math.abs(event.clientY - drag.y);
    drag = null; viewport.classList.remove('dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointercancel' && Math.abs(offset) > Math.min(80, viewport.clientWidth * .15) && Math.abs(offset) > vertical) move(index + (offset < 0 ? 1 : -1));
    else { paint(); schedule(); }
  }
  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  window.addEventListener('appzlanguagechange', () => { paint(false); settle(); pauseLabel(); });
  paint(false); pauseLabel(); schedule();
});

document.addEventListener('DOMContentLoaded', () => {
  const sheet = document.querySelector('.resource-sheet');
  const buttons = [...document.querySelectorAll('.resource-image')];
  const expand = sheet.querySelector('.sheet-expand');
  const sheetMedia = sheet.querySelector('.sheet-media');
  const sheetImage = sheet.querySelector('.sheet-image');
  function alignExpandedText() {
    let inset = 0;
    if (sheet.classList.contains('sheet-expanded') && sheetImage.naturalWidth && sheetImage.naturalHeight) {
      const imageWidth = Math.min(sheetMedia.clientWidth, sheetMedia.clientHeight * sheetImage.naturalWidth / sheetImage.naturalHeight);
      inset = Math.max(0, (sheetMedia.clientWidth - imageWidth) / 2);
    }
    sheet.style.setProperty('--sheet-image-inset', `${inset}px`);
  }
  new ResizeObserver(alignExpandedText).observe(sheetMedia);
  sheetImage.addEventListener('load', alignExpandedText);
  function updateExpandButton() {
    const expanded = sheet.classList.contains('sheet-expanded');
    const label = window.appzText(expanded ? 'Restaurar tamanho do painel' : 'Expandir painel');
    expand.setAttribute('aria-label', label);
    expand.title = label;
    expand.setAttribute('aria-pressed', String(expanded));
    alignExpandedText();
  }
  expand.addEventListener('click', () => {
    sheet.classList.toggle('sheet-expanded');
    sheet.scrollTop = 0;
    updateExpandButton();
  });
  window.addEventListener('appzlanguagechange', updateExpandButton);
  updateExpandButton();
  let opener, current = 0, images = [];
  function renderSheet() {
    const row = opener.closest('.resource-row');
    sheet.querySelector('.sheet-image').src = images[current];
    const groupTitle = row.closest('.resource-subsection').querySelector('h3').textContent;
    sheet.querySelector('.sheet-image').alt = `Appz — ${groupTitle}, ${window.appzEnglish() ? 'image' : 'imagem'} ${current + 1}.`;
    sheet.querySelector('.sheet-subsection').textContent = groupTitle;
    sheet.querySelector('.sheet-text').textContent = row.querySelector('p').textContent;
    sheet.querySelector('.sheet-position').textContent = `${current + 1} / ${images.length}`;
    sheet.querySelector('.sheet-navigation').hidden = images.length < 2;
    sheet.scrollTop = 0;
  }
  window.addEventListener('appzlanguagechange', () => { if (sheet.open) renderSheet(); });
  function navigate(direction) { current = (current + direction + images.length) % images.length; renderSheet(); }
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      images = button.dataset.images.split(',').map(path => path.trim());
      current = 0; renderSheet();
      sheet.showModal();
      document.body.classList.add('sheet-open');
    });
  });
  sheet.querySelector('.sheet-prev').addEventListener('click', () => navigate(-1));
  sheet.querySelector('.sheet-next').addEventListener('click', () => navigate(1));
  sheet.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  sheet.querySelector('.sheet-close').addEventListener('click', () => sheet.close());
  sheet.addEventListener('click', event => {
    const rect = sheet.getBoundingClientRect();
    if (event.target === sheet && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) sheet.close();
  });
  sheet.addEventListener('close', () => {
    document.body.classList.remove('sheet-open');
    sheet.classList.remove('sheet-expanded');
    updateExpandButton();
    opener?.focus({preventScroll:true});
  });
});
