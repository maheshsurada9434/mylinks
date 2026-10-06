/*
 * mylinks renderer: turns a profile object into a complete HTML page.
 * Used by the build script (Node) and by the editor (browser), so the
 * preview always matches what gets published.
 */
(function (root) {
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SAFE = /^(https?:|mailto:|tel:|upi:|sms:)/i;
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (SAFE.test(u)) return u;
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
    return '';
  }

  /* ---------- themes ---------- */
  const THEMES = {
    aurora: {
      label: 'Aurora', dark: true, font: 'Plus+Jakarta+Sans:wght@400;600;800', family: '"Plus Jakarta Sans"',
      vars: { bg: '#0c0b1d', ink: '#f4f2ff', muted: '#b9b4d9', card: 'rgba(255,255,255,.08)', cardInk: '#f4f2ff', cardBorder: 'rgba(255,255,255,.14)', accent: '#9b8cff', accentInk: '#0c0b1d', radius: '18px', shadow: '0 10px 30px -18px rgba(0,0,0,.8)' },
      bg: `radial-gradient(40% 35% at 15% 10%, rgba(155,140,255,.55), transparent 70%), radial-gradient(35% 30% at 90% 20%, rgba(34,211,238,.35), transparent 70%), radial-gradient(45% 40% at 70% 95%, rgba(244,114,182,.35), transparent 70%), #0c0b1d`,
      extra: '.card{backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}',
    },
    notebook: {
      label: 'Notebook', dark: false, font: 'Caveat:wght@700&family=Nunito:wght@400;600;800', family: '"Nunito"', display: '"Caveat"', displaySize: '54px',
      vars: { bg: '#fbfdff', ink: '#1b2a4a', muted: '#5a6a8a', card: '#ffffff', cardInk: '#1b2a4a', cardBorder: '#c9d6ee', accent: '#2f6fed', accentInk: '#ffffff', radius: '6px', shadow: '2px 3px 0 #c9d6ee' },
      bg: `linear-gradient(90deg, transparent 54px, #f5b3b3 54px, #f5b3b3 56px, transparent 56px), repeating-linear-gradient(#fbfdff 0 31px, #dbe6f7 31px 32px)`,
    },
    masala: {
      label: 'Masala', dark: false, font: 'Baloo+2:wght@400;600;800', family: '"Baloo 2"',
      vars: { bg: '#f4b400', ink: '#3b0a12', muted: '#6b2a1d', card: '#fff4cf', cardInk: '#3b0a12', cardBorder: '#3b0a12', accent: '#a3122a', accentInk: '#fff4cf', radius: '16px', shadow: '4px 4px 0 #3b0a12' },
      bg: `radial-gradient(circle at 20% 0%, #ffd34d, transparent 50%), radial-gradient(circle at 100% 100%, #e8890c, transparent 55%), #f4b400`,
    },
    neon: {
      label: 'Neon', dark: true, font: 'Sora:wght@400;600;800', family: '"Sora"',
      vars: { bg: '#07070b', ink: '#f5f5ff', muted: '#a3a3c2', card: '#0f0f18', cardInk: '#f5f5ff', cardBorder: '#ff2bd6', accent: '#22e1ff', accentInk: '#07070b', radius: '14px', shadow: '0 0 0 1px #ff2bd655, 0 0 24px -6px #ff2bd6' },
      bg: `radial-gradient(60% 40% at 50% 0%, rgba(255,43,214,.25), transparent 70%), radial-gradient(50% 40% at 50% 100%, rgba(34,225,255,.18), transparent 70%), #07070b`,
    },
    matcha: {
      label: 'Matcha', dark: false, font: 'Outfit:wght@400;600;800', family: '"Outfit"',
      vars: { bg: '#dfe8d2', ink: '#1f2b1c', muted: '#556b4f', card: '#f4f8ee', cardInk: '#1f2b1c', cardBorder: '#c3d3b2', accent: '#4f7a3a', accentInk: '#f4f8ee', radius: '22px', shadow: '0 8px 22px -16px rgba(31,43,28,.6)' },
      bg: `radial-gradient(50% 40% at 0% 0%, #eef4e4, transparent 70%), #dfe8d2`,
    },
    y2k: {
      label: 'Y2K', dark: false, font: 'Rubik:wght@400;600;800', family: '"Rubik"',
      vars: { bg: '#f3e8ff', ink: '#1a1033', muted: '#4b3f6b', card: 'rgba(255,255,255,.72)', cardInk: '#1a1033', cardBorder: 'rgba(255,255,255,.95)', accent: '#7b2ff7', accentInk: '#ffffff', radius: '999px', shadow: '0 8px 24px -12px rgba(123,47,247,.5), inset 0 1px 0 #fff' },
      bg: `linear-gradient(135deg, #ffd6f5 0%, #d9c8ff 30%, #c4f1ff 60%, #d8ffe8 100%)`,
      extra: '.card{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
    },
    mono: {
      label: 'Mono', dark: false, font: 'Archivo+Black&family=IBM+Plex+Mono:wght@400;600', family: '"IBM Plex Mono"', display: '"Archivo Black"', displaySize: '40px',
      vars: { bg: '#ffffff', ink: '#000000', muted: '#3a3a3a', card: '#ffffff', cardInk: '#000000', cardBorder: '#000000', accent: '#ffe600', accentInk: '#000000', radius: '0px', shadow: '5px 5px 0 #000' },
      bg: '#ffffff', extra: '.card{border-width:3px}.name{text-transform:uppercase;letter-spacing:-.02em}',
    },
    sunset: {
      label: 'Sunset', dark: true, font: 'Poppins:wght@400;600;800', family: '"Poppins"',
      vars: { bg: '#ff5a5f', ink: '#ffffff', muted: 'rgba(255,255,255,.85)', card: 'rgba(255,255,255,.16)', cardInk: '#ffffff', cardBorder: 'rgba(255,255,255,.35)', accent: '#ffffff', accentInk: '#e0245e', radius: '16px', shadow: '0 10px 30px -18px rgba(60,0,40,.7)' },
      bg: `linear-gradient(170deg, #ff9a3c 0%, #ff4e6a 45%, #7b3ff2 100%)`,
    },
  };

  /* ---------- icons (generic glyphs, no brand logos) ---------- */
  const P = d => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    instagram: P('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
    youtube: P('<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>'),
    x: P('<path d="M4 4l16 16M20 4 4 20"/>'),
    threads: P('<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/>'),
    github: P('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
    linkedin: P('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    whatsapp: P('<path d="M4 20l1.4-4.2A8 8 0 1 1 8.2 18.6z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1.2"/>'),
    telegram: P('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 7-5"/>'),
    email: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    phone: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    website: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    spotify: P('<circle cx="12" cy="12" r="9"/><path d="M7.5 10c3-1 6.5-.7 9 .8M8 13c2.4-.7 5-.5 7 .7M8.5 15.8c1.8-.5 3.7-.3 5.2.5"/>'),
    facebook: P('<circle cx="12" cy="12" r="9"/><path d="M13 21v-8h3M13 13v-2a2 2 0 0 1 2-2h1.5M10.5 13H13"/>'),
    discord: P('<path d="M6 7c4-2 8-2 12 0l2 9c-2 2-4 3-5 3l-1-2c-1.4.3-2.6.3-4 0l-1 2c-1 0-3-1-5-3z"/><circle cx="9.5" cy="12.5" r="1" fill="currentColor"/><circle cx="14.5" cy="12.5" r="1" fill="currentColor"/>'),
    link: P('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    share: P('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>'),
    contact: P('<circle cx="12" cy="9" r="4"/><path d="M4 20c1.5-4 4.5-5 8-5s6.5 1 8 5"/>'),
    rupee: P('<path d="M7 4h11M7 9h11M7 4h3a5 5 0 0 1 0 10H7l8 7"/>'),
    copy: P('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
    location: P('<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
  };
  const SOCIALS = {
    instagram: ['Instagram', h => `https://instagram.com/${h}`],
    youtube: ['YouTube', h => /^https?:/.test(h) ? h : `https://youtube.com/@${h.replace(/^@/, '')}`],
    x: ['X', h => `https://x.com/${h}`],
    threads: ['Threads', h => `https://threads.net/@${h}`],
    github: ['GitHub', h => `https://github.com/${h}`],
    linkedin: ['LinkedIn', h => /^https?:/.test(h) ? h : `https://linkedin.com/in/${h}`],
    whatsapp: ['WhatsApp', h => `https://wa.me/${String(h).replace(/[^\d]/g, '')}`],
    telegram: ['Telegram', h => `https://t.me/${h}`],
    email: ['Email', h => `mailto:${h}`],
    phone: ['Call', h => `tel:${String(h).replace(/[^\d+]/g, '')}`],
    spotify: ['Spotify', h => h],
    facebook: ['Facebook', h => /^https?:/.test(h) ? h : `https://facebook.com/${h}`],
    discord: ['Discord', h => h],
    website: ['Website', h => h],
  };

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
  }
  function avatarSrc(p, t) {
    const a = String(p.avatar || '').trim();
    if (a) return /^(https?:|data:)/.test(a) ? a : a.replace(/^\.?\//, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${t.vars.accent}"/><text x="60" y="60" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="46" fill="${t.vars.accentInk}">${esc(initials(p.name))}</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  function youtubeId(u) {
    const m = String(u || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function stripHandle(s) { return String(s || '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?(instagram\.com|x\.com|twitter\.com|github\.com|t\.me|threads\.net\/@?)\//i, '').replace(/\/$/, ''); }

  function normalize(p) {
    p = p && typeof p === 'object' ? p : {};
    const links = (Array.isArray(p.links) ? p.links : []).map(l => ({
      title: String(l.title || '').trim(), url: safeUrl(l.url), subtitle: String(l.subtitle || '').trim(),
      emoji: String(l.emoji || '').trim().slice(0, 4), highlight: !!l.highlight, hidden: !!l.hidden,
    })).filter(l => l.title && l.url && !l.hidden);
    const socials = {};
    const s = p.socials && typeof p.socials === 'object' ? p.socials : {};
    for (const k of Object.keys(SOCIALS)) if (s[k] && String(s[k]).trim()) socials[k] = String(s[k]).trim();
    return {
      name: String(p.name || 'Your Name').trim(), handle: String(p.handle || '').trim().replace(/^@?/, '@').replace(/^@$/, ''),
      bio: String(p.bio || '').trim(), location: String(p.location || '').trim(), avatar: String(p.avatar || '').trim(),
      theme: THEMES[p.theme] ? p.theme : 'aurora', links, socials,
      youtube: youtubeId(p.youtube) || null,
      upi: p.upi && p.upi.id ? { id: String(p.upi.id).trim(), note: String(p.upi.note || 'Support my work').trim() } : null,
      contact: p.contact !== false, siteUrl: String(p.siteUrl || '').trim().replace(/\/?$/, '/'),
      lang: String(p.lang || 'en').trim(),
    };
  }

  function css(t) {
    const v = t.vars;
    return `:root{--bg:${v.bg};--ink:${v.ink};--muted:${v.muted};--card:${v.card};--card-ink:${v.cardInk};--card-border:${v.cardBorder};--accent:${v.accent};--accent-ink:${v.accentInk};--radius:${v.radius};--shadow:${v.shadow};--font:${t.family},system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--display:${t.display || t.family},system-ui,sans-serif;color-scheme:${t.dark ? 'dark' : 'light'}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;background:${t.bg};background-attachment:fixed;color:var(--ink);font-family:var(--font);font-size:16px;line-height:1.45;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:560px;margin:0 auto;padding:max(40px,env(safe-area-inset-top)) 18px 40px;display:flex;flex-direction:column;align-items:center;gap:22px}
.top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;animation:rise .5s cubic-bezier(.2,.8,.2,1) both}
.avatar{width:104px;height:104px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 4px var(--card-border),var(--shadow);margin-bottom:8px;background:var(--card)}
.name{margin:0;font-family:var(--display);font-size:${t.displaySize || '30px'};font-weight:800;letter-spacing:-.02em;line-height:1.05}
.handle{color:var(--muted);font-weight:600;font-size:15px}
.bio{margin:6px 0 0;max-width:42ch;color:var(--ink);opacity:.92;font-size:16px;white-space:pre-line}
.loc{display:inline-flex;align-items:center;gap:4px;color:var(--muted);font-size:14px;margin-top:2px}
.loc svg{width:15px;height:15px}
.socials{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;animation:rise .5s .05s cubic-bezier(.2,.8,.2,1) both}
.soc{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--card);color:var(--card-ink);border:1.5px solid var(--card-border);text-decoration:none;transition:transform .15s}
.soc:hover{transform:translateY(-2px)}
.soc svg{width:21px;height:21px}
.links{width:100%;display:flex;flex-direction:column;gap:12px;margin:0;padding:0;list-style:none}
.links li{animation:rise .5s cubic-bezier(.2,.8,.2,1) both}
.card{display:flex;align-items:center;gap:14px;width:100%;min-height:60px;padding:12px 18px;border-radius:var(--radius);background:var(--card);color:var(--card-ink);border:1.5px solid var(--card-border);box-shadow:var(--shadow);text-decoration:none;transition:transform .15s,box-shadow .15s;position:relative}
.card:hover{transform:translateY(-2px)}
.card:active{transform:scale(.98)}
.card .em{width:30px;flex-shrink:0;font-size:22px;text-align:center}
.card .tx{flex:1;min-width:0;text-align:center}
.card .em + .tx{text-align:left}
.card b{display:block;font-weight:700;font-size:16px;overflow-wrap:anywhere}
.card small{display:block;color:inherit;opacity:.75;font-size:13.5px;margin-top:1px}
.card.hl{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.card .go{width:18px;height:18px;opacity:.6;flex-shrink:0}
.card .go svg{width:18px;height:18px}
.video{width:100%;aspect-ratio:16/9;border:0;border-radius:var(--radius);box-shadow:var(--shadow);background:#000}
.upi{width:100%;padding:16px 18px;border-radius:var(--radius);background:var(--card);color:var(--card-ink);border:1.5px solid var(--card-border);box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px;text-align:center}
.upi p{margin:0;font-weight:700}
.upi .row{display:flex;gap:8px}
.btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 16px;border-radius:calc(var(--radius) * .8);border:1.5px solid var(--card-border);background:transparent;color:inherit;font:inherit;font-weight:700;font-size:15px;text-decoration:none;cursor:pointer}
.btn.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn svg{width:18px;height:18px}
.actions{display:flex;gap:10px;width:100%}
.foot{margin-top:6px;font-size:13px;color:var(--muted);text-align:center}
.foot a{font-weight:700;text-decoration:none;border-bottom:1.5px solid currentColor}
.toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;transition:.2s;background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:12px;font-weight:600;font-size:14px;pointer-events:none}
.toast.show{opacity:1;transform:translate(-50%,0)}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
@keyframes rise{from{opacity:0;transform:translateY(12px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
${t.extra || ''}`;
  }

  /**
   * renderPage(profile, opts) -> full HTML document string
   * opts.repo     "owner/name" for the footer link
   * opts.preview  true inside the editor (no analytics-free extras needed)
   */
  function renderPage(profile, opts) {
    opts = opts || {};
    const p = normalize(profile);
    const t = THEMES[p.theme];
    const url = p.siteUrl !== '/' ? p.siteUrl : '';
    const title = p.handle ? `${p.name} (${p.handle})` : p.name;
    const desc = p.bio ? p.bio.replace(/\s+/g, ' ').slice(0, 160) : `Links from ${p.name}`;
    const sameAs = Object.entries(p.socials).filter(([k]) => !['email', 'phone', 'whatsapp'].includes(k)).map(([k, v]) => SOCIALS[k][1](stripHandle(v)));
    const ld = { '@context': 'https://schema.org', '@type': 'Person', name: p.name, description: p.bio || undefined, url: url || undefined,
      alternateName: p.handle || undefined, image: /^https?:/.test(p.avatar) ? p.avatar : (url && p.avatar ? url + p.avatar.replace(/^\.?\//, '') : undefined),
      address: p.location ? { '@type': 'PostalAddress', addressLocality: p.location } : undefined, sameAs: sameAs.length ? sameAs : undefined };
    const repo = opts.repo || 'maheshsurada9434/mylinks';
    let i = 0;
    const socialHtml = Object.entries(p.socials).map(([k, v]) => {
      const href = k === 'website' || k === 'spotify' || k === 'discord' ? safeUrl(v) : SOCIALS[k][1](k === 'email' || k === 'phone' || k === 'whatsapp' ? v : stripHandle(v));
      if (!safeUrl(href)) return '';
      return `<a class="soc" href="${esc(href)}" target="_blank" rel="noopener me" aria-label="${SOCIALS[k][0]}" title="${SOCIALS[k][0]}">${ICONS[k]}</a>`;
    }).join('');
    const linkHtml = p.links.map(l => `<li style="animation-delay:${0.08 + (i++) * 0.04}s"><a class="card ${l.highlight ? 'hl' : ''}" href="${esc(l.url)}" target="_blank" rel="noopener">
      ${l.emoji ? `<span class="em" aria-hidden="true">${esc(l.emoji)}</span>` : ''}<span class="tx"><b>${esc(l.title)}</b>${l.subtitle ? `<small>${esc(l.subtitle)}</small>` : ''}</span>
      ${l.emoji ? `<span class="go">${ICONS.link}</span>` : ''}</a></li>`).join('');
    const upiHref = p.upi ? `upi://pay?pa=${encodeURIComponent(p.upi.id)}&pn=${encodeURIComponent(p.name)}&cu=INR` : '';
    return `<!DOCTYPE html>
<html lang="${esc(p.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="${t.vars.bg}">
${url ? `<link rel="canonical" href="${esc(url)}">` : ''}
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${url ? `<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(url)}og.png"><meta name="twitter:image" content="${esc(url)}og.png">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${esc(avatarSrc(p, t))}">
<link rel="alternate" type="text/plain" href="llms.txt" title="llms.txt">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${t.font}&display=swap">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>${css(t)}</style>
</head>
<body>
<main class="wrap">
  <header class="top">
    <img class="avatar" src="${esc(avatarSrc(p, t))}" alt="${esc(p.name)}" width="104" height="104">
    <h1 class="name">${esc(p.name)}</h1>
    ${p.handle ? `<div class="handle">${esc(p.handle)}</div>` : ''}
    ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ''}
    ${p.location ? `<div class="loc">${ICONS.location}${esc(p.location)}</div>` : ''}
  </header>
  ${socialHtml ? `<nav class="socials" aria-label="Social profiles">${socialHtml}</nav>` : ''}
  ${linkHtml ? `<ul class="links">${linkHtml}</ul>` : ''}
  ${p.youtube ? `<iframe class="video" src="https://www.youtube-nocookie.com/embed/${p.youtube}" title="Latest video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` : ''}
  ${p.upi ? `<section class="upi" aria-label="Support with UPI"><p>${esc(p.upi.note)}</p><div class="row">
      <a class="btn primary" href="${esc(upiHref)}">${ICONS.rupee}Pay via UPI</a>
      <button class="btn" data-copy="${esc(p.upi.id)}" aria-label="Copy UPI ID ${esc(p.upi.id)}">${ICONS.copy}Copy UPI ID</button></div></section>` : ''}
  <div class="actions">
    ${p.contact ? `<a class="btn" href="contact.vcf" download>${ICONS.contact}Save contact</a>` : ''}
    <button class="btn" data-share>${ICONS.share}Share</button>
  </div>
  <p class="foot">Made with <a href="https://github.com/${esc(repo)}" target="_blank" rel="noopener">mylinks</a>. Make your own free page.</p>
</main>
<div class="toast" role="status" aria-live="polite"></div>
<script>
(function(){var t=document.querySelector('.toast');function say(m){t.textContent=m;t.classList.add('show');clearTimeout(say.x);say.x=setTimeout(function(){t.classList.remove('show')},1800)}
document.addEventListener('click',function(e){var c=e.target.closest('[data-copy]');if(c){navigator.clipboard&&navigator.clipboard.writeText(c.dataset.copy).then(function(){say('UPI ID copied')},function(){say(c.dataset.copy)});}
var s=e.target.closest('[data-share]');if(s){var d={title:document.title,url:location.href};if(navigator.share){navigator.share(d).catch(function(){})}else if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(function(){say('Link copied')})}}});})();
</script>
</body>
</html>`;
  }

  /* ---------- llms.txt (https://llmstxt.org) ---------- */
  function renderLlms(profile) {
    const p = normalize(profile);
    const lines = [`# ${p.name}${p.handle ? ` (${p.handle})` : ''}`, ''];
    if (p.bio) lines.push(`> ${p.bio.replace(/\n+/g, ' ')}`, '');
    if (p.location) lines.push(`Based in ${p.location}.`, '');
    if (p.links.length) { lines.push('## Links', ''); p.links.forEach(l => lines.push(`- [${l.title}](${l.url})${l.subtitle ? `: ${l.subtitle}` : ''}`)); lines.push(''); }
    const soc = Object.entries(p.socials).filter(([k]) => !['phone'].includes(k));
    if (soc.length) {
      lines.push('## Profiles', '');
      soc.forEach(([k, v]) => {
        const href = ['website', 'spotify', 'discord'].includes(k) ? safeUrl(v) : SOCIALS[k][1](['email', 'whatsapp'].includes(k) ? v : stripHandle(v));
        lines.push(`- [${SOCIALS[k][0]}](${href})`);
      });
      lines.push('');
    }
    if (p.youtube) lines.push('## Featured video', '', `- [Watch on YouTube](https://www.youtube.com/watch?v=${p.youtube})`, '');
    return lines.join('\n');
  }

  /* ---------- vCard ---------- */
  function renderVcard(profile) {
    const p = normalize(profile);
    const v = s => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const out = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${v(p.name)}`, `N:${v(p.name)};;;;`];
    if (p.bio) out.push(`NOTE:${v(p.bio)}`);
    if (p.socials.email) out.push(`EMAIL;TYPE=INTERNET:${v(p.socials.email)}`);
    if (p.socials.phone) out.push(`TEL;TYPE=CELL:${v(p.socials.phone)}`);
    if (p.siteUrl !== '/') out.push(`URL:${p.siteUrl}`);
    if (p.location) out.push(`ADR;TYPE=HOME:;;;${v(p.location)};;;`);
    out.push('END:VCARD');
    return out.join('\r\n') + '\r\n';
  }

  /* ---------- share image (1200x630) ---------- */
  function renderOg(profile) {
    const p = normalize(profile); const t = THEMES[p.theme];
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${t.font}&display=block"><style>${css(t)}
      body{width:1200px;height:630px;overflow:hidden;margin:0;display:flex;align-items:center;padding:0 90px;gap:60px}
      .avatar{width:260px;height:260px;margin:0;box-shadow:0 0 0 8px var(--card-border),var(--shadow)}
      .name{font-size:84px} .handle{font-size:34px;margin-top:10px} .bio{font-size:32px;margin-top:22px;max-width:24ch;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
      .pill{display:inline-block;margin-top:28px;padding:12px 24px;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-weight:800;font-size:26px}</style></head>
      <body><img class="avatar" src="${esc(avatarSrc(p, t))}"><div><div class="name">${esc(p.name)}</div>${p.handle ? `<div class="handle">${esc(p.handle)}</div>` : ''}${p.bio ? `<div class="bio">${esc(p.bio)}</div>` : ''}<div class="pill">${plural(p.links.length, 'link')} inside</div></div></body></html>`;
  }
  function plural(n, w) { return `${n} ${w}${n === 1 ? '' : 's'}`; }

  const api = { renderPage, renderLlms, renderVcard, renderOg, normalize, THEMES, SOCIALS, safeUrl };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MyLinks = api;
})(typeof window !== 'undefined' ? window : globalThis);
