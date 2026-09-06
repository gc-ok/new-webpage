/* Shared, dependency-free onboarding. Demo state never connects to a school account. */
window.DemoUI = (() => {
  let toastTimer;
  function toast(message) {
    let el = document.querySelector('.demo-toast');
    if (!el) { el = document.createElement('div'); el.className = 'demo-toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.textContent = ''; }, 5000);
  }
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function tour(key, steps) {
    const dialog = document.createElement('dialog'); dialog.className = 'demo-tour'; dialog.setAttribute('aria-labelledby', 'tour-title');
    dialog.innerHTML = '<div class="tour-top"><span>Quick tour</span><button class="tour-close" aria-label="Close tour">×</button></div><div class="tour-body"><h2 id="tour-title"></h2><p id="tour-copy"></p><div class="tour-context"></div></div><div class="tour-bottom"><span class="tour-progress"></span><button class="tour-back">Back</button><button class="tour-next">Show me around</button></div>';
    document.body.append(dialog); let index = 0, highlighted, opener;
    const seen = () => { try { localStorage.setItem(key, 'seen'); } catch (_) {} };
    const clean = () => { highlighted?.classList.remove('tour-highlight'); highlighted = null; };
    function position() {
      dialog.classList.remove('tour-positioned'); dialog.style.cssText = '';
      if (!highlighted || innerWidth < 900) return;
      const r = highlighted.getBoundingClientRect(), w = 440, h = dialog.offsetHeight;
      const left = r.right + 24 + w < innerWidth ? r.right + 24 : Math.max(16, innerWidth - w - 28);
      dialog.classList.add('tour-positioned'); dialog.style.left = left + 'px'; dialog.style.top = Math.max(16, Math.min(r.top, innerHeight - h - 16)) + 'px';
    }
    function render() {
      clean(); const step = steps[index]; step.prepare?.();
      dialog.querySelector('h2').textContent = step.title; dialog.querySelector('#tour-copy').textContent = step.text;
      dialog.querySelector('.tour-context').textContent = step.hint || 'Interactive demo · Fictional data · No emails are sent';
      dialog.querySelector('.tour-progress').textContent = `${index + 1} / ${steps.length}`;
      dialog.querySelector('.tour-back').hidden = index === 0;
      dialog.querySelector('.tour-next').textContent = index === steps.length - 1 ? 'Start exploring' : index === 0 ? 'Show me around' : 'Next';
      highlighted = step.target ? document.querySelector(step.target) : null;
      highlighted?.classList.add('tour-highlight'); highlighted?.scrollIntoView({block:'center', behavior:'instant'}); position();
    }
    function close() { seen(); clean(); dialog.close(); opener?.focus(); }
    dialog.querySelector('.tour-close').onclick = close;
    dialog.querySelector('.tour-back').onclick = () => { index--; render(); };
    dialog.querySelector('.tour-next').onclick = () => { if (index === steps.length - 1) close(); else { index++; render(); } };
    dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
    window.addEventListener('resize', position);
    function start() { if (dialog.open) return; opener = document.activeElement; index = 0; dialog.showModal(); render(); }
    document.querySelectorAll('[data-tour]').forEach(button => button.addEventListener('click', start));
    let first = true; try { first = !localStorage.getItem(key); } catch (_) {}
    // Embedded portfolio previews stay unobstructed and do not consume the first visit.
    if (first && window.self === window.top) setTimeout(start, 700);
    return {start};
  }
  return {toast, escape, tour};
})();
