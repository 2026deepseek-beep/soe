window.MD = (() => {
  'use strict';
  const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function inline(text) {
    const codes = [];
    text = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000CODE${codes.length-1}\u0000`; });
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async">');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    text = text.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    return text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
  }
  function parse(md) {
    if (!md) return '';
    md = md.replace(/\r\n/g, '\n');
    const codeBlocks = [];
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => { codeBlocks.push({lang, code}); return `\u0000BLOCK${codeBlocks.length-1}\u0000`; });
    const lines = md.split('\n'), out = [];
    let inList = null, inQuote = false, inTable = false, tableRows = [];
    const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
    const closeQuote = () => { if (inQuote) { out.push('</blockquote>'); inQuote = false; } };
    const closeTable = () => {
      if (inTable && tableRows.length) {
        let html = '<table>';
        tableRows.forEach((row, i) => { const tag = i === 0 ? 'th' : 'td'; html += '<tr>' + row.map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>'; });
        out.push(html + '</table>'); inTable = false; tableRows = [];
      }
    };
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line.trim()) { closeList(); closeQuote(); closeTable(); continue; }
      if (/^\|(.+)\|$/.test(line)) {
        const cells = line.split('|').slice(1, -1);
        if (/^[\s|:-]+$/.test(lines[i+1] || '')) { closeList(); closeQuote(); inTable = true; tableRows.push(cells); i++; continue; }
        if (inTable) { tableRows.push(cells); continue; }
      } else { closeTable(); }
      let m;
      if ((m = line.match(/^(#{1,6})\s+(.+)$/))) { closeList(); closeQuote(); out.push(`<h${m[1].length} id="${m[2].toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-')}">${inline(m[2])}</h${m[1].length}>`); continue; }
      if (/^(---|\*\*\*|___)$/.test(line.trim())) { closeList(); closeQuote(); out.push('<hr>'); continue; }
      if ((m = line.match(/^>\s?(.*)$/))) { if (!inQuote) { closeList(); out.push('<blockquote>'); inQuote = true; } out.push(`<p>${inline(m[1])}</p>`); continue; } else if (inQuote) closeQuote();
      if ((m = line.match(/^[-*+]\s+(.+)$/))) { if (inList !== 'ul') { closeList(); out.push('<ul>'); inList = 'ul'; } out.push(`<li>${inline(m[1])}</li>`); continue; }
      if ((m = line.match(/^\d+\.\s+(.+)$/))) { if (inList !== 'ol') { closeList(); out.push('<ol>'); inList = 'ol'; } out.push(`<li>${inline(m[1])}</li>`); continue; }
      closeList(); out.push(`<p>${inline(line)}</p>`);
    }
    closeList(); closeQuote(); closeTable();
    let html = out.join('\n');
    return html.replace(/\u0000BLOCK(\d+)\u0000/g, (_, i) => `<pre><code class="language-${codeBlocks[i].lang}">${esc(codeBlocks[i].code.trim())}</code></pre>`);
  }
  return { parse };
})();