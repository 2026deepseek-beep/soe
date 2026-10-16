(() => {
  'use strict';
  document.getElementById('year')?.append(new Date().getFullYear());
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const BASE = '.';
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const formatDate = iso => new Date(iso).toLocaleDateString('id-ID', {year:'numeric',month:'long',day:'numeric'});

  function injectSchema(schemas) {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());
    schemas.filter(Boolean).forEach(s => {
      const tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.textContent = JSON.stringify(s);
      document.head.appendChild(tag);
    });
  }

  // ===== HOME =====
  async function loadHome() {
    const container = $('posts');
    if (!container) return;
    try {
      const res = await fetch(`${BASE}/posts/index.json`, {cache:'no-cache'});
      const posts = await res.json();
      posts.sort((a,b) => new Date(b.date) - new Date(a.date));
      renderPosts(posts);
      $('search')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        renderPosts(posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags||[]).some(t => t.toLowerCase().includes(q))
        ));
      });
    } catch (err) {
      container.innerHTML = `<div class="error">Gagal memuat artikel.</div>`;
    }
  }
  function renderPosts(posts) {
    const c = $('posts');
    if (!posts.length) { c.innerHTML = '<div class="loading">Belum ada artikel.</div>'; return; }
    c.innerHTML = posts.map(p => `
      <article class="post-card">
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
        <div class="meta">
          <time datetime="${p.date}">📅 ${formatDate(p.date)}</time>
          ${p.readingTime ? `<span>⏱️ ${p.readingTime} menit</span>` : ''}
          ${p.tags ? p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('') : ''}
        </div>
        <p class="excerpt">${esc(p.description)}</p>
        <a class="read-more" href="post.html?slug=${encodeURIComponent(p.slug)}">Baca →</a>
      </article>
    `).join('');
  }

  // ===== POST =====
  async function loadPost() {
    const container = $('article');
    if (!container || !slug) {
      if (container) container.innerHTML = '<div class="error">Artikel tidak ditemukan.</div>';
      return;
    }
    try {
      const res = await fetch(`${BASE}/posts/${encodeURIComponent(slug)}.json`, {cache:'no-cache'});
      if (!res.ok) throw new Error('Artikel tidak ditemukan');
      const post = await res.json();

      // SEO Update
      document.title = `${post.title} — Blog Saya`;
      $('meta-desc').setAttribute('content', post.description);
      const canonicalURL = `${location.origin}${location.pathname}?slug=${slug}`;
      $('canonical').setAttribute('href', canonicalURL);
      $('og-title').setAttribute('content', post.title);
      $('og-desc').setAttribute('content', post.description);
      // OG URL
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property','og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalURL);
      // Keywords
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement('meta');
        kw.setAttribute('name','keywords');
        document.head.appendChild(kw);
      }
      kw.setAttribute('content', (post.tags||[]).join(', '));

      // AI SEO Meta
      let aiMeta = document.querySelector('meta[name="ai-content-declaration"]');
      if (!aiMeta) {
        aiMeta = document.createElement('meta');
        aiMeta.setAttribute('name','ai-content-declaration');
        document.head.appendChild(aiMeta);
      }
      aiMeta.setAttribute('content','human-written, editor-reviewed');

      // Schemas
      injectSchema([
        AISEO.articleSchema(post, slug),
        AISEO.faqSchema(post.faqs || []),
        AISEO.howToSchema(post, post.steps),
        AISEO.breadcrumbSchema(post, slug)
      ]);

      // Render (Markdown → HTML)
      const html = MD.parse(post.content || '');
      const summary = post.aiSummary || AISEO.summary(post.content || '');

      container.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a> / <span>${esc(post.title)}</span>
        </nav>
        <h1>${esc(post.title)}</h1>
        <div class="meta">
          <time datetime="${post.date}">📅 ${formatDate(post.date)}</time>
          <span>✍️ ${esc(post.author||'Admin')}</span>
          <span>⏱️ ${post.readingTime || AISEO.readingTime(post.content||'')} menit baca</span>
          ${post.tags ? post.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('') : ''}
        </div>
        ${summary ? `<aside class="article-summary" aria-label="Ringkasan"><strong>TL;DR:</strong> ${esc(summary)}</aside>` : ''}
        <div class="content">${html}</div>
      `;

      // FAQ section otomatis
      if (post.faqs && post.faqs.length) {
        const faqHTML = `
          <section class="faq-section">
            <h2>❓ Pertanyaan Umum</h2>
            ${post.faqs.map(f => `
              <details>
                <summary><strong>${esc(f.q)}</strong></summary>
                <p>${esc(f.a)}</p>
              </details>
            `).join('')}
          </section>`;
        container.querySelector('.content').insertAdjacentHTML('afterend', faqHTML);
      }
    } catch (err) {
      container.innerHTML = `<div class="error">${esc(err.message)}</div>`;
    }
  }

  if (slug) loadPost();
  else loadHome();
})();