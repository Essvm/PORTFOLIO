/* Shared project rendering: the image arrays in projects.js are the source of truth. */
(function (root) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => String(value).padStart(2, '0');
  function summary(projects) {
    return { projects: projects.length, visuals: projects.reduce((n, p) => n + p.images.length, 0) };
  }
  function bars(projects) {
    return projects.map((p, i) => `<a href="${escape(p.url)}" class="project-bar-item c-${escape(p.color)}" data-category="${escape(p.category)}"><div class="bar-left"><span class="bar-num">${pad(i + 1)}</span><span class="bar-title">${escape(p.title)}</span></div><div class="bar-right"><span class="bar-count-badge">${pad(p.images.length)} VISUALS</span><span class="bar-arrow">→</span></div></a>`).join('\n');
  }
  function cards(projects) {
    return projects.map((p, i) => `<article class="project-card" data-category="${escape(p.category)}"><div class="project-card-header"><span class="card-num-pill">PROJECT ${pad(i + 1)}</span><span class="card-cat-pill">${escape(p.label)}</span></div><div class="project-card-thumb"><img src="${escape(p.cover)}" alt="${escape(p.title)}" loading="lazy"><span class="card-overlay-badge">${p.images.length} IMAGES</span></div><div class="project-card-body"><div><h3 class="project-card-title">${escape(p.title)}</h3><p class="project-card-desc">${escape(p.description)}</p></div><div class="project-card-footer"><span class="pill-tag ${escape(p.color)}">${escape(p.category)}</span><a href="${escape(p.url)}" class="card-view-btn">View Gallery (${p.images.length}) →</a></div></div></article>`).join('\n');
  }
  function gallery(project) {
    return project.images.map((im, i) => `<div class="gallery-item"><a href="${escape(im.src)}" class="gallery-image-link" data-caption="${escape(im.caption)}"><img src="${escape(im.src)}" alt="${escape(im.caption)}" width="${im.width}" height="${im.height}" loading="${i ? 'lazy' : 'eager'}" decoding="async"></a><div class="gallery-caption-box"><span class="gallery-caption-text">${escape(im.caption)}</span><button type="button" class="zoom-hint-btn">Enlarge ⤢</button></div></div>`).join('\n');
  }
  function init() {
    const projects = root.PORTFOLIO_PROJECTS;
    if (!projects) return;
    const totals = summary(projects);
    document.querySelectorAll('[data-project-count]').forEach(el => { el.textContent = pad(totals.projects); });
    document.querySelectorAll('[data-visual-count]').forEach(el => { el.textContent = pad(totals.visuals); });
    document.querySelectorAll('[data-all-projects]').forEach(el => { el.textContent = `All (${totals.projects})`; });
    const barList = document.querySelector('.project-bars-list');
    const cardList = document.querySelector('.project-cards-grid');
    if (barList) barList.innerHTML = bars(projects);
    if (cardList) cardList.innerHTML = cards(projects);
    if (barList) document.querySelector('meta[property="og:description"]')?.setAttribute('content', `Bold ideas. Clear visuals. Creative work that makes brands stand out. ${totals.projects} project series across ${totals.visuals} curated visuals.`);
    const projectGallery = document.querySelector('[data-project-gallery]');
    if (projectGallery) {
      const project = projects.find(p => p.url === projectGallery.dataset.projectGallery);
      if (project) {
        projectGallery.innerHTML = gallery(project);
        document.querySelectorAll('[data-gallery-count]').forEach(el => { el.textContent = project.images.length; });
      }
    }
  }
  const api = { summary, bars, cards, gallery, init };
  root.Portfolio = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
