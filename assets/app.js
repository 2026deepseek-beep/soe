(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();

  const BASE = location.pathname.includes('/posts/') ? '..' : '.';
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  const formatDate = (iso) => new Date(iso).toLocaleDateString('id-ID', {
    year:'numeric', month:'long', day:'numeric'
  });

  const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  // ===== HOMEPAGE =====
  async function loadHome() {
    const container = document.getElementById('posts');
    if (!container) return;
    try {
      const res = await fetch(`${BASE}/posts/index.json`, {cache:'no-cache'});
      if (!res.ok) throw new Error('Gagal memuat');
      const posts = await res.json();
      posts.sort((a,b) => new Date(b.date) - new Date(a.date));
      renderPosts(posts);
      document.getElementById('search')?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        renderPosts(posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags||[]).some(t => t.toLowerCase().includes(q))
        ));
      });
    } catch (err) {
      container.innerHTML = `<div class="error">Gagal memuat artikel. ${escapeHTML(err.message)}</div>`;
    }
  }

  function renderPosts(posts) {
    const container = document.getElementById('posts');
    if (!posts.length) {
      container.innerHTML = '<div class="loading">Belum ada artikel.</div>';
      return;
    }
    container.innerHTML = posts.map(p => `
      <article class="post-card">
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHTML(p.title)}</a></h2>
        <div class="meta">
          <time datetime="${p.date}">📅 ${formatDate(p.date)}</time>
          ${p.tags ? p.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('') : ''}
        </div>
        <p class="excerpt">${escapeHTML(p.description)}</p>
        <a class="read-more" href="post.html?slug=${encodeURIComponent(p.slug)}">Baca selengkapnya →</a>
      </article>
    `).join('');
  }

  // ===== POST PAGE =====
  async function loadPost() {
    const container = document.getElementById('article');
    if (!container || !slug) {
      if (container) container.innerHTML = '<div class="error">Artikel tidak ditemukan.</div>';
      return;
    }
    try {
      const res = await fetch(`${BASE}/posts/${encodeURIComponent(slug)}.json`, {cache:'no-cache'});
      if (!res.ok) throw new Error('Artikel tidak ditemukan');
      const post = await res.json();

      // SEO updates
      document.title = `${post.title} — Blog Saya`;
      document.getElementById('meta-desc').setAttribute('content', post.description);
      document.getElementById('canonical').setAttribute('href', `${location.origin}${location.pathname}?slug=${slug}`);
      document.getElementById('og-title').setAttribute('content', post.title);
      document.getElementById('og-desc').setAttribute('content', post.description);

      // Article schema
      document.getElementById('article-schema').textContent = JSON.stringify({
        "@context":"https://schema.org","@type":"BlogPosting",
        "headline":post.title,"description":post.description,
        "datePublished":post.date,"dateModified":post.updated||post.date,
        "author":{"@type":"Person","name":post.author||"Admin"},
        "mainEntityOfPage":{"@type":"WebPage","@id":location.href}
      });

      container.innerHTML = `
        <h1>${escapeHTML(post.title)}</h1>
        <div class="meta">
          <time datetime="${post.date}">📅 ${formatDate(post.date)}</time>
          <span>✍️ ${escapeHTML(post.author||'Admin')}</span>
          ${post.tags ? post.tags.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('') : ''}
        </div>
        <div class="content">${post.content}</div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="error">${escapeHTML(err.message)}</div>`;
    }
  }

  // Route
  if (slug) loadPost();
  else loadHome();
})();