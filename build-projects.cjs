// Run after changing projects.js to refresh static pages for SEO and no-JS visitors.
const fs = require('node:fs');
const path = require('node:path');
require('./projects.js');
const render = require('./portfolio.js');
const projects = globalThis.PORTFOLIO_PROJECTS;
const totals = render.summary(projects);
const pad = value => String(value).padStart(2, '0');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(__dirname, file), content);
const versionAssets = html => html.replace(/((?:href|src)="(?:styles\.css|projects\.js|portfolio\.js))(?:\?[^"\s]*)?"/g, '$1?v=eish-20261119"');

let home = read('index.html');
home = home.replace(/<!-- PROJECT_BARS_START -->[\s\S]*?<!-- PROJECT_BARS_END -->/, `<!-- PROJECT_BARS_START -->${render.bars(projects)}<!-- PROJECT_BARS_END -->`);
home = home.replace(/<!-- PROJECT_CARDS_START -->[\s\S]*?<!-- PROJECT_CARDS_END -->/, `<!-- PROJECT_CARDS_START -->${render.cards(projects)}<!-- PROJECT_CARDS_END -->`);
home = home.replace(/(data-project-count>)[^<]*/g, `$1${pad(totals.projects)}`)
  .replace(/(data-visual-count>)[^<]*/g, `$1${totals.visuals}`)
  .replace(/(data-all-projects>)[^<]*/g, `$1All (${totals.projects})`)
  .replace(/\d+ project series across \d+ curated visuals/g, `${totals.projects} project series across ${totals.visuals} curated visuals`);
write('index.html', versionAssets(home));

projects.forEach((project, index) => {
  let page = read(project.url);
  page = page.replace(/PROJECT (?:\d+|<span data-project-number>\d+<\/span>)/g, `PROJECT <span data-project-number>${pad(index + 1)}</span>`);
  page = page.replace(/(class="project-num-tag">[\s\S]*?&nbsp;●&nbsp; )\d+ VISUALS/, `$1<span data-gallery-count>${project.images.length}</span> VISUALS`)
    .replace(/COMPLETE GALLERY \(\d+ VISUALS\)/, `COMPLETE GALLERY (<span data-gallery-count>${project.images.length}</span> VISUALS)`)
    .replace(/(data-gallery-count>)\d+/g, `$1${project.images.length}`)
    .replace(/(class="lightbox-counter">)1 \/ \d+/, (_, prefix) => `${prefix}1 / ${project.images.length}`);
  page = page.replace(/<section class="gallery-grid"[^>]*>[\s\S]*?<\/section>/, `<section class="gallery-grid" data-project-gallery="${escape(project.url)}" aria-label="${escape(project.title)} project gallery">\n<!-- PROJECT_GALLERY_START -->${render.gallery(project)}<!-- PROJECT_GALLERY_END -->\n      </section>`);
  page = page.replace(/<a href="[^"]*" class="page-nav-link (prev|next)"([^>]*)>[\s\S]*?<\/a>/g, (_, direction, attributes) => {
    const previous = direction === 'prev';
    const neighborIndex = (index + (previous ? -1 : 1) + projects.length) % projects.length;
    const neighbor = projects[neighborIndex];
    const label = attributes.includes('aria-label=')
      ? (previous ? '← Previous Project' : 'Next Project →')
      : `${previous ? '← ' : ''}${pad(neighborIndex + 1)}. ${escape(neighbor.navTitle || neighbor.title)}${previous ? '' : ' →'}`;
    return `<a href="${escape(neighbor.url)}" class="page-nav-link ${direction}"${attributes}>${label}</a>`;
  });
  page = page.replace(/  <script src="(?:projects|portfolio)\.js(?:\?[^"]*)?"><\/script>\n/g, '');
  page = page.replace('  <script src="script.js"></script>', '  <script src="projects.js"></script>\n  <script src="portfolio.js"></script>\n  <script src="script.js"></script>');
  write(project.url, versionAssets(page));
});

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://essvm.github.io/PORTFOLIO/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n${projects.map(p => `  <url><loc>https://essvm.github.io/PORTFOLIO/${escape(p.url)}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n')}\n</urlset>\n`);
console.log(`${totals.projects} projects, ${totals.visuals} visuals`);
