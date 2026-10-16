window.AISEO = (() => {
  'use strict';

  const abs = (path) => new URL(path, location.origin + location.pathname.replace(/\/[^/]*$/, '/')).href;

  function articleSchema(post, slug) {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "abstract": post.description,
      "articleBody": stripMd(post.content).slice(0, 5000),
      "wordCount": stripMd(post.content).split(/\s+/).length,
      "inLanguage": post.lang || "id-ID",
      "datePublished": post.date,
      "dateModified": post.updated || post.date,
      "author": {
        "@type": "Person",
        "name": post.author || "Admin"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Blog Saya"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": abs(`post.html?slug=${slug}`)
      },
      "keywords": (post.tags || []).join(", "),
      "articleSection": post.category || (post.tags && post.tags[0]) || "Umum",
      "isAccessibleForFree": true,
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".article-summary"]
      }
    };
  }

  function faqSchema(faqs) {
    if (!faqs || !faqs.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {"@type": "Answer", "text": f.a}
      }))
    };
  }

  function howToSchema(post, steps) {
    if (!steps || !steps.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": post.title,
      "description": post.description,
      "step": steps.map((s, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "name": s.name,
        "text": s.text
      }))
    };
  }

  function breadcrumbSchema(post, slug) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": abs("index.html")},
        {"@type": "ListItem", "position": 2, "name": post.title, "item": abs(`post.html?slug=${slug}`)}
      ]
    };
  }

  function extractFAQs(md) {
    const faqs = [];
    const lines = md.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^##\s+(.+\?)\s*$/);
      if (m) {
        let answer = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (/^#{1,6}\s/.test(lines[j])) break;
          if (lines[j].trim()) answer += lines[j].trim() + ' ';
        }
        if (answer) faqs.push({q: m[1], a: answer.trim()});
      }
    }
    return faqs;
  }

  function extractSteps(md) {
    const steps = [];
    const lines = md.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^##\s+\d+\.\s+(.+)$/);
      if (m) {
        let text = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (/^#{1,6}\s/.test(lines[j])) break;
          if (lines[j].trim()) text += lines[j].trim() + ' ';
        }
        steps.push({name: m[1], text: text.trim().slice(0, 200)});
      }
    }
    return steps.length >= 2 ? steps : null;
  }

  function stripMd(md) {
    return md
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#>*_~\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function summary(md, maxLen = 260) {
    const text = stripMd(md);
    if (text.length <= maxLen) return text;
    const cut = text.slice(0, maxLen);
    const lastDot = cut.lastIndexOf('. ');
    return (lastDot > 100 ? cut.slice(0, lastDot + 1) : cut + '...');
  }

  function readingTime(md) {
    const words = stripMd(md).split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }

  return { articleSchema, faqSchema, howToSchema, breadcrumbSchema, extractFAQs, extractSteps, stripMd, summary, readingTime };
})();