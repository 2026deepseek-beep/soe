// Mini Markdown parser — mendukung heading, bold, italic, link, list, code, blockquote, tabel, hr, image
window.MD = (() => {
  'use strict';

  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function inline(text) {
    // Code inline dulu (agar tidak diproses lagi)
    const codes = [];
    text = text.replace(/`([^`]+)`/g, (_, c) => {
      codes.push(c);
      return `\u0000CODE${codes.length-1}\u0000`;
    });

    // Image ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async">');

    // Link [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text* atau _text_
    text = text.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    text = text.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');

    // Strikethrough ~~text~~
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Restore code
    text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);

    return text;
  }

  function parse(md) {
    if (!md) return '';
    md = md.replace(/\r\n/g, '\n');

    // Code block ``` ... ```
    const codeBlocks = [];
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      codeBlocks.push({lang, code});
      return `\u0000BLOCK${codeBlocks.length-1}\u0000`;
    });

    const lines = md.split('\n');
    const out = [];
    let inList = null;
    let inQuote = false;
    let inTable = false;
    let tableRows = [];

    const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
    const closeQuote = () => { if (inQuote) { out.push('</blockquote>'); inQuote = false; } };
    const closeTable = () => {
      if (inTable && tableRows.length) {
        let html = '<table>';
        tableRows.forEach((row, i) => {
          const tag = i === 0 ? 'th' : 'td';
          html += '<tr>' + row.map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>';
        });
        html += '</table>';
        out.push(html);
        inTable = false;
        tableRows = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Kosong
      if (!line.trim()) {
        closeList(); closeQuote(); closeTable();
        continue;
      }

      // Tabel | a | b |
      if (/^\|(.+)\|$/.test(line)) {
        const cells = line.split('|').slice(1, -1);
        if (/^[\s|:-]+$/.test(lines[i+1] || '')) {
          closeList(); closeQuote();
          inTable = true;
          tableRows.push(cells);
          i++; // skip separator
          continue;
        }
        if (inTable) { tableRows.push(cells); continue; }
      } else {
        closeTable();
      }

      // Heading
      let m;
      if ((m = line.match(/^(#{1,6})\s+(.+)$/))) {
        closeList(); closeQuote();
        const level = m[1].length;
        const text = inline(m[2]);
        const id = m[2].toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-');
        out.push(`<h${level} id="${id}">${text}</h${level}>`);
        continue;
      }

      // HR
      if (/^(---|\*\*\*|___)$/.test(line.trim())) {
        closeList(); closeQuote();
        out.push('<hr>');
        continue;
      }

      // Blockquote
      if ((m = line.match(/^>\s?(.*)$/))) {
        if (!inQuote) { closeList(); out.push('<blockquote>'); inQuote = true; }
        out.push(`<p>${inline(m[1])}</p>`);
        continue;
      } else if (inQuote) closeQuote();

      // Unordered list
      if ((m = line.match(/^[-*+]\s+(.+)$/))) {
        if (inList !== 'ul') { closeList(); out.push('<ul>'); inList = 'ul'; }
        out.push(`<li>${inline(m[1])}</li>`);
        continue;
      }

      // Ordered list
      if ((m = line.match(/^\d+\.\s+(.+)$/))) {
        if (inList !== 'ol') { closeList(); out.push('<ol>'); inList = 'ol'; }
        out.push(`<li>${inline(m[1])}</li>`);
        continue;
      }

      closeList();

      // Paragraph
      out.push(`<p>${inline(line)}</p>`);
    }

    closeList(); closeQuote(); closeTable();

    let html = out.join('\n');

    // Restore code blocks
    html = html.replace(/\u0000BLOCK(\d+)\u0000/g, (_, i) => {
      const {lang, code} = codeBlocks[i];
      const cls = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${cls}>${esc(code.trim())}</code></pre>`;
    });

    return html;
  }

  return { parse };
})();