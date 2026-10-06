// Builds the site into dist/ from profile.json. No dependencies.
// Usage: node scripts/build.mjs [--site https://you.github.io/mylinks/] [--repo owner/name]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const R = require(path.join(root, 'src/render.js'));

const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const repo = arg('--repo') || process.env.GITHUB_REPOSITORY || 'maheshsurada9434/mylinks';
const [owner, name] = repo.split('/');
const site = (arg('--site') || (process.env.GITHUB_REPOSITORY ? (name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${owner}.github.io/` : `https://${owner}.github.io/${name}/`) : '')).replace(/\/?$/, '/');

let profile;
try { profile = JSON.parse(fs.readFileSync(path.join(root, 'profile.json'), 'utf8')); }
catch (e) { console.error(`profile.json is not valid JSON: ${e.message}\nTip: check for a missing comma or quote near that position.`); process.exit(1); }
profile.siteUrl = site === '/' ? '' : site;

const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const p = R.normalize(profile);
const warn = [];
if (!p.links.length) warn.push('No links yet. Add some to "links" in profile.json.');
(Array.isArray(profile.links) ? profile.links : []).forEach((l, i) => { if (l && l.title && !R.safeUrl(l.url)) warn.push(`Link ${i + 1} ("${l.title}") has no valid URL, so it was skipped.`); });
if (profile.theme && !R.THEMES[profile.theme]) warn.push(`Unknown theme "${profile.theme}". Using aurora. Themes: ${Object.keys(R.THEMES).join(', ')}`);

fs.writeFileSync(path.join(out, 'index.html'), R.renderPage(profile, { repo }));
fs.writeFileSync(path.join(out, 'llms.txt'), R.renderLlms(profile));
fs.writeFileSync(path.join(out, 'contact.vcf'), R.renderVcard(profile));
fs.writeFileSync(path.join(out, 'og.html'), R.renderOg(profile));
fs.writeFileSync(path.join(out, 'profile.json'), JSON.stringify(profile, null, 2));
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n${site !== '/' ? `Sitemap: ${site}sitemap.xml\n` : ''}`);
if (site !== '/') fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}</loc></url></urlset>\n`);
fs.writeFileSync(path.join(out, '.nojekyll'), '');

// Local avatar or other images referenced from the repo
const av = String(profile.avatar || '');
if (av && !/^(https?:|data:)/.test(av)) {
  const src = path.join(root, av);
  if (fs.existsSync(src)) { fs.mkdirSync(path.dirname(path.join(out, av)), { recursive: true }); fs.copyFileSync(src, path.join(out, av)); }
  else warn.push(`Avatar "${av}" was not found in the repo. Upload it or use an image URL.`);
}

// Editor
fs.mkdirSync(path.join(out, 'editor'), { recursive: true });
fs.copyFileSync(path.join(root, 'editor/index.html'), path.join(out, 'editor/index.html'));
fs.copyFileSync(path.join(root, 'src/render.js'), path.join(out, 'editor/render.js'));

console.log(`Built ${p.name}'s page with ${p.links.length} links, theme "${p.theme}"${site !== '/' ? `, for ${site}` : ''}`);
warn.forEach(w => console.log('WARNING: ' + w));
