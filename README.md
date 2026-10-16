# 📝 Blog CMS — Tailwind + AI SEO

Blog statis untuk GitHub Pages dengan Tailwind CSS, Markdown editor, dan optimasi SEO AI 2026 (llms.txt, FAQ Schema, HowTo Schema).

## ✨ Fitur

- ✅ Tailwind CSS (build lokal, no CDN)
- ✅ Markdown editor dengan live preview
- ✅ Auto-generate JSON, FAQ Schema, HowTo Schema
- ✅ `llms.txt` + `llms-full.txt` untuk AI crawler
- ✅ JSON Feed untuk AI aggregator
- ✅ Dark mode otomatis
- ✅ Zero framework (vanilla JS)
- ✅ Lighthouse 95+

## 🚀 Setup Cepat

### Opsi A: Pakai Node.js (Rekomendasi)

```bash
git clone https://github.com/USERNAME/blog.git
cd blog
npm install
npm run build
```

### Opsi B: Pakai Standalone Binary (Tanpa Node.js)

**Windows:**
1. Download [tailwindcss-windows-x64.exe](https://github.com/tailwindlabs/tailwindcss/releases/latest)
2. Rename jadi `tw.exe`, taruh di root folder
3. Double-click `build.bat`

**Linux/Mac:**
```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
chmod +x tailwindcss-linux-x64
mv tailwindcss-linux-x64 tw
./build.sh
```

### Opsi C: GitHub Actions (Otomatis)

Push apa saja ke `main` → Action auto-build CSS. Tidak perlu install apapun lokal.

## 📝 Cara Menulis Artikel

1. Buka `admin.html` (bisa lokal atau setelah live)
2. Tulis pakai Markdown di tab **Editor**
3. Isi metadata di tab **SEO Meta**
4. Klik tombol di tab **Output JSON** untuk generate:
   - `posts/SLUG.json` — file artikel
   - `posts/index.json` — manifest (tambahkan entry)
   - `llms.txt` — daftar untuk AI (tambahkan baris)
   - `llms-full.txt` — konten lengkap untuk AI
   - `feed.json` — RSS untuk AI aggregator
   - `sitemap.xml` — untuk Google
5. Copy-paste hasil ke file yang sesuai di repo
6. Commit & push

## 🔧 Development

```bash
# Terminal 1: watch CSS
npm run watch

# Terminal 2: serve lokal
npx serve .
```

Buka http://localhost:3000

## 📁 Struktur

```
.
├── .github/workflows/build.yml   # Auto-build CSS
├── src/input.css                 # Source Tailwind
├── assets/
│   ├── style.css                 # Hasil build (auto)
│   ├── app.js                    # Logika blog
│   ├── markdown.js               # Parser Markdown
│   └── ai-seo.js                 # Generator schema
├── posts/
│   ├── index.json                # Manifest artikel
│   └── SLUG.json                 # Konten artikel
├── *.html                        # Halaman
├── llms.txt, llms-full.txt       # AI SEO
├── feed.json                     # JSON Feed
├── robots.txt, sitemap.xml       # SEO klasik
└── tailwind.config.js
```

## 🌐 Deploy ke GitHub Pages

1. Push repo ke GitHub
2. **Settings → Pages**
3. **Source:** `Deploy from a branch`
4. **Branch:** `main` / **Folder:** `/ (root)`
5. Klik **Save**
6. Tunggu 1-2 menit → live di `https://USERNAME.github.io/REPO/`

## 📌 Ganti URL

Sebelum deploy, ganti semua `2026deepseek-beep` di file-file ini dengan username GitHub Anda:

- `index.html`, `post.html`, `admin.html`
- `sitemap.xml`, `robots.txt`
- `llms.txt`, `llms-full.txt`, `feed.json`

Cari & replace cepat:
```bash
grep -rl "2026deepseek-beep" . | xargs sed -i 's/2026deepseek-beep/USERNAME_ANDA/g'
```

## 📊 SEO Checklist

- [x] Meta description dinamis
- [x] Canonical URL
- [x] Open Graph + Twitter Card
- [x] BlogPosting + FAQPage + HowTo + Breadcrumb Schema
- [x] Sitemap & robots.txt (dengan AI crawler allowlist)
- [x] llms.txt & llms-full.txt
- [x] JSON Feed
- [x] TL;DR summary (AI citation bait)
- [x] Speakable schema (voice search)
- [x] Semantic HTML5
- [x] Mobile responsive
- [x] Dark mode
- [x] Zero CDN

## 📄 Lisensi

MIT — bebas dipakai, dimodifikasi, dan didistribusikan.