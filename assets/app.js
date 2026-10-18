(() => {
  'use strict';
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const currentLang = params.get('lang') || 'id-ID';
  const formatDate = iso => new Date(iso).toLocaleDateString(currentLang === 'en-US' ? 'en-US' : 'id-ID', {year:'numeric',month:'long',day:'numeric'});

  function injectSchema(schemas) {
    document.querySelectorAll('script[data-ai-schema]').forEach(s => s.remove());
    schemas.filter(Boolean).forEach(s => {
      const tag = document.createElement('script');
      tag.type = 'application/ld+json'; tag.setAttribute('data-ai-schema', 'true');
      tag.textContent = JSON.stringify(s); document.head.appendChild(tag);
    });
  }

  async function loadHome() {
    const c = $('posts'); if (!c) return;
    try {
      const res = await fetch(`./posts/index.json`, {cache:'no-cache'});
      if (!res.ok) throw new Error('Gagal memuat');
      let posts = await res.json();
      
      posts = posts.filter(p => (p.lang || 'id-ID') === currentLang);
      posts.sort((a,b) => new Date(b.date) - new Date(a.date));
      renderPosts(posts);
      
      $('search')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        renderPosts(posts.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q))));
      });
    } catch (err) { c.innerHTML = '<div class="error">Gagal memuat artikel.</div>'; }
  }

  function renderPosts(posts) {
    const c = $('posts');
    if (!posts.length) { c.innerHTML = '<div class="loading">Belum ada artikel.</div>'; return; }
    c.innerHTML = posts.map(p => {
      // Gunakan link post.html?slug=xxx
      const postUrl = `post.html?slug=${encodeURIComponent(p.slug)}`;
      return `
      <article class="post-card">
        <h2 class="post-card-title"><a href="${postUrl}">${esc(p.title)}</a></h2>
        <div class="post-meta">
          <time datetime="${p.date}">📅 ${formatDate(p.date)}</time>
          ${p.readingTime ? `<span>⏱️ ${p.readingTime} menit</span>` : ''}
          ${(p.tags||[]).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
        </div>
        <p class="post-excerpt">${esc(p.description)}</p>
        <a class="read-more" href="${postUrl}">Baca selengkapnya →</a>
      </article>
    `;
    }).join('');
  }

  async function loadPost() {
    const c = $('article'); if (!c || !slug) { if (c) c.innerHTML = '<div class="error">Artikel tidak ditemukan.</div>'; return; }
    try {
      const res = await fetch(`./posts/${encodeURIComponent(slug)}.json`, {cache:'no-cache'});
      if (!res.ok) throw new Error('Artikel tidak ditemukan');
      const post = await res.json();
      
      const canonicalURL = `${location.origin}${location.pathname}?slug=${slug}`;
      document.title = `${post.title} — Blog Soe`;
      $('meta-desc')?.setAttribute('content', post.description);
      $('canonical')?.setAttribute('href', canonicalURL);
      $('og-title')?.setAttribute('content', post.title);
      $('og-desc')?.setAttribute('content', post.description);
      $('og-url')?.setAttribute('content', canonicalURL);
      
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) { kw = document.createElement('meta'); kw.setAttribute('name','keywords'); document.head.appendChild(kw); }
      kw.setAttribute('content', (post.tags||[]).join(', '));
      
      injectSchema([ AISEO.articleSchema(post, slug), AISEO.faqSchema(post.faqs || []), AISEO.howToSchema(post, post.steps), AISEO.breadcrumbSchema(post, slug) ]);
      
      const html = MD.parse(post.content || '');
      const summary = post.aiSummary || AISEO.summary(post.content || '');
      
      c.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>${esc(post.title)}</span></nav>
        <h1 class="article-title">${esc(post.title)}</h1>
        <div class="article-meta">
          <time datetime="${post.date}">📅 ${formatDate(post.date)}</time>
          <span>✍️ ${esc(post.author||'Admin')}</span>
          <span>⏱️ ${post.readingTime || AISEO.readingTime(post.content||'')} menit baca</span>
          <span class="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-bold uppercase">${post.lang || 'id-ID'}</span>
          ${(post.tags||[]).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
        </div>
        ${summary ? `<aside class="article-summary" aria-label="Ringkasan"><strong>TL;DR:</strong> ${esc(summary)}</aside>` : ''}
        <div class="article-content">${html}</div>
      `;
      
      if (post.faqs && post.faqs.length) {
        const faq = document.createElement('section'); faq.className = 'faq-section';
        faq.innerHTML = `<h2>❓ Pertanyaan Umum</h2>${post.faqs.map(f => `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}`;
        c.appendChild(faq);
      }
    } catch (err) { c.innerHTML = `<div class="error">${esc(err.message)}</div>`; }
  }
  if (slug) loadPost(); else loadHome();
})();