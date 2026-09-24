(() => {
  'use strict';

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwEd1GQnzYY_IYsc-T-0LWtGbXf4VmxSOKYWzTvn49y-m66NeMiC7PSLgyJL6NJ1DCt/exec';
  const root = document.documentElement;
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function initTheme() {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('p666z-theme'); } catch (_) { /* التخزين قد يكون محظوراً */ }
    const theme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    root.classList.add('theme-ready');
    const button = document.getElementById('theme-toggle');
    const updateLabel = () => {
      const next = root.dataset.theme === 'dark' ? 'الفاتح' : 'الداكن';
      button?.setAttribute('aria-label', `التبديل إلى الوضع ${next}`);
      button?.setAttribute('title', `التبديل إلى الوضع ${next}`);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#151916' : '#f7f7f4');
    };
    updateLabel();
    button?.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('p666z-theme', root.dataset.theme); } catch (_) { /* الثيم يعمل دون حفظ */ }
      updateLabel();
    });
  }

  function initMobileNav() {
    const button = document.getElementById('menu-toggle');
    const nav = document.getElementById('mobile-nav');
    if (!button || !nav) return;
    const close = () => {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'فتح قائمة التنقل');
      nav.hidden = true;
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
      nav.hidden = !open;
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    document.addEventListener('click', event => {
      if (!nav.hidden && !nav.contains(event.target) && !button.contains(event.target)) close();
    });
  }

  function initSectionNavigation() {
    const sections = [...document.querySelectorAll('.page-section[id]')];
    const links = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
    if (!('IntersectionObserver' in window) || !sections.length || !links.length) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-23% 0px -60% 0px', threshold: [0, .15, .4] });
    sections.forEach(section => observer.observe(section));
  }

  async function copyUsername() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText('@p666z');
      } else {
        const field = document.createElement('textarea');
        field.value = '@p666z';
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('copy unavailable');
      }
      showToast('تم نسخ المعرّف @p666z');
    } catch (_) { showToast('تعذّر النسخ، جرّب تحديد المعرّف يدوياً'); }
  }

  function initCopyButtons() {
    document.getElementById('copy-username')?.addEventListener('click', copyUsername);
    document.getElementById('copy-handle')?.addEventListener('click', copyUsername);
  }

  function formatCount(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) return '—';
    return new Intl.NumberFormat('en', { notation: number >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(number);
  }

  async function requestStats(action) {
    const response = await fetch(`${GAS_URL}?action=${encodeURIComponent(action)}`, {
      method: 'GET', mode: 'cors', cache: 'no-store', signal: AbortSignal.timeout(6500)
    });
    if (!response.ok) throw new Error('stats request failed');
    const data = await response.json();
    if (!data || data.success !== true || !Number.isFinite(Number(data.count))) throw new Error('invalid stats response');
    return Number(data.count);
  }

  async function refreshCounts() {
    const [visitors, likes] = await Promise.allSettled([requestStats('getVisitors'), requestStats('getLikes')]);
    const visitorsNode = document.getElementById('visitor-count');
    const likesNode = document.getElementById('likes-count');
    if (visitors.status === 'fulfilled' && visitorsNode) visitorsNode.textContent = formatCount(visitors.value);
    if (likes.status === 'fulfilled' && likesNode) likesNode.textContent = formatCount(likes.value);
  }

  async function recordVisit() {
    try {
      await fetch(`${GAS_URL}?action=visit`, { method: 'GET', mode: 'cors', cache: 'no-store', signal: AbortSignal.timeout(5000) });
    } catch (_) { /* تعطل الإحصاءات لا ينبغي أن يؤثر في الصفحة */ }
  }

  function initLike() {
    const button = document.getElementById('like-btn');
    if (!button) return;
    try {
      if (localStorage.getItem('p666z-has-liked') === 'true') {
        button.classList.add('is-liked');
        button.setAttribute('aria-pressed', 'true');
      }
    } catch (_) { /* يمكن استخدام الزر من دون تخزين */ }

    button.addEventListener('click', async () => {
      try {
        if (localStorage.getItem('p666z-has-liked') === 'true') {
          showToast('شكراً لك، سبق وأعجبت بالصفحة');
          return;
        }
      } catch (_) { /* تابع إذا كان التخزين غير متاح */ }
      button.disabled = true;
      try {
        const response = await fetch(`${GAS_URL}?action=like`, { method: 'GET', mode: 'cors', cache: 'no-store', signal: AbortSignal.timeout(7000) });
        if (!response.ok) throw new Error('like request failed');
        const result = await response.json();
        if (result?.success !== true) throw new Error('like not accepted');
        button.classList.add('is-liked');
        button.setAttribute('aria-pressed', 'true');
        try { localStorage.setItem('p666z-has-liked', 'true'); } catch (_) { /* استمر في الجلسة الحالية */ }
        const count = document.getElementById('likes-count');
        if (count && Number.isFinite(Number(result.count))) count.textContent = formatCount(result.count);
        else await refreshCounts();
        showToast('شكراً لإعجابك ودعمك');
      } catch (_) {
        showToast('تعذّر تسجيل الإعجاب الآن، حاول لاحقاً');
      } finally {
        button.disabled = false;
      }
    });
  }

  function init() {
    initTheme();
    initMobileNav();
    initSectionNavigation();
    initCopyButtons();
    initLike();
    refreshCounts();
    recordVisit();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
