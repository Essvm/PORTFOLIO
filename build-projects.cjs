// Optional static regeneration for SEO and visitors without JavaScript.
const fs = require('node:fs');
require('./projects.js');
const render = require('./portfolio.js');
const projects = globalThis.PORTFOLIO_PROJECTS;
const totals = render.summary(projects);
let home = fs.readFileSync('index.html', 'utf8');
home = home.replace(/<!-- PROJECT_BARS_START -->[\s\S]*?<!-- PROJECT_BARS_END -->/, `<!-- PROJECT_BARS_START -->${render.bars(projects)}<!-- PROJECT_BARS_END -->`);
home = home.replace(/<!-- PROJECT_CARDS_START -->[\s\S]*?<!-- PROJECT_CARDS_END -->/, `<!-- PROJECT_CARDS_START -->${render.cards(projects)}<!-- PROJECT_CARDS_END -->`);
home = home.replace(/(data-project-count>)[^<]*/g, `$1${String(totals.projects).padStart(2, '0')}`).replace(/(data-visual-count>)[^<]*/g, `$1${totals.visuals}`).replace(/(data-all-projects>)[^<]*/g, `$1All (${totals.projects})`).replace(/\d+ project series across \d+ curated visuals/g, `${totals.projects} project series across ${totals.visuals} curated visuals`);
fs.writeFileSync('index.html', home);
const fuzy = projects.find(p => p.url === 'fuzy-fruit-soda.html');
let page = fs.readFileSync(fuzy.url, 'utf8');
page = page.replace(/<!-- FUZY_GALLERY_START -->[\s\S]*?<!-- FUZY_GALLERY_END -->/, `<!-- FUZY_GALLERY_START -->${render.gallery(fuzy)}<!-- FUZY_GALLERY_END -->`);
fs.writeFileSync(fuzy.url, page);
console.log(`${totals.projects} projects, ${totals.visuals} visuals`);
