/* Live managed catalogue, with the original project list as an offline fallback. */
(function (root) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => String(value).padStart(2, '0');
  function summary(projects) {
    return { projects: projects.length, visuals: projects.reduce((n, p) => n + p.images.length, 0) };
  }
  function bars(projects) {
    return projects.map((p, i) => `<a href="${escape(p.url)}" class="project-bar-item c-${escape(p.color)}" data-category="${escape(p.category)}"><div class="bar-left"><span class="bar-num">${pad(i + 1)}</span><span class="bar-title">${escape(p.title)}</span></div><div class="bar-right"><span class="bar-count-badge">${pad(p.images.length)} VISUALS</span><span class="bar-arrow">→</span></div></a>`).join('\n');
  }
  function imageSource(im,kind='display'){const candidate=im?.variants?.[kind];return candidate&&allowedImage(candidate.src)?candidate.src:im?.src||'';}
  function responsive(im){const variants=[im?.variants?.thumbnail,im?.variants?.display].filter(v=>v&&allowedImage(v.src));return variants.length?' srcset="'+variants.map(v=>escape(v.src)+' '+v.width+'w').join(', ')+'" sizes="(max-width: 700px) 94vw, 55vw"':'';}
  function cards(projects) {
    return projects.map((p, i) => `<article class="project-card" data-category="${escape(p.category)}"><div class="project-card-header"><span class="card-num-pill">PROJECT ${pad(i + 1)}</span><span class="card-cat-pill">${escape(p.label)}</span></div><div class="project-card-thumb${p.coverShape === 'panoramic' ? ' is-panoramic' : ''}"><img src="${escape(imageSource(p.images.find(im=>im.src===p.cover)||{src:p.cover},'thumbnail'))}" alt="${escape(p.title)}" loading="lazy"><span class="card-overlay-badge">${p.images.length} IMAGES</span></div><div class="project-card-body"><div><h3 class="project-card-title">${escape(p.title)}</h3><p class="project-card-desc">${escape(p.description)}</p></div><div class="project-card-footer"><span class="pill-tag ${escape(p.color)}">${escape(p.category)}</span><a href="${escape(p.url)}" class="card-view-btn">View Gallery (${p.images.length}) →</a></div></div></article>`).join('\n');
  }
  function gallery(project) {
    return project.images.map((im, i) => `<div class="gallery-item${im.width / im.height > 2.2 ? ' is-panoramic' : ''}"><a href="${escape(im.src)}" class="gallery-image-link" data-caption="${escape(im.caption)}"><img src="${escape(imageSource(im))}"${responsive(im)} alt="${escape(im.caption)}" width="${im.width}" height="${im.height}" loading="${i ? 'lazy' : 'eager'}" decoding="async"></a><div class="gallery-caption-box"><span class="gallery-caption-text">${escape(im.caption)}</span><button type="button" class="zoom-hint-btn">Enlarge ⤢</button></div></div>`).join('\n');
  }
  const LOCAL_PREVIEW = typeof location !== 'undefined' && ['localhost', '127.0.0.1'].includes(location.hostname);
  const CONTENT_URL = LOCAL_PREVIEW ? '/api/projects' : 'https://essam-portfolio-metrics.rubyplume16385.chatgpt.site/portfolio';
  function allowedImage(value) {
    try { const url = new URL(value, 'https://essvm.github.io/PORTFOLIO/'); return !url.username && !url.password && !url.search && !url.hash && ((LOCAL_PREVIEW && url.origin === location.origin && /^\/(?:preview-media|media)\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(url.pathname)) || (url.origin === 'https://essvm.github.io' && /^\/PORTFOLIO\//.test(url.pathname)) || (url.origin === 'https://essam-portfolio-metrics.rubyplume16385.chatgpt.site' && /^\/media\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(url.pathname))); } catch { return false; }
  }
  async function load() {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch(CONTENT_URL, { cache: 'no-store', credentials: 'omit', signal: controller.signal });
      if (!response.ok) throw Error('Content unavailable');
      const body = await response.json();
      if (!Array.isArray(body.projects) || body.projects.length < 1 || body.projects.length > 100) throw Error('Invalid content');
      const ids = new Set();
      for (const project of body.projects) {
        if (typeof project.id !== 'string' || ids.has(project.id) || typeof project.title !== 'string' || !/^(?:[a-z0-9-]+\.html|project\.html\?id=[a-z0-9][a-z0-9-]{1,79})$/.test(project.url) || !allowedImage(project.cover) || !Array.isArray(project.images) || !project.images.length || project.images.length > 500 || !project.images.every(im => allowedImage(im.src) && Number.isInteger(im.width) && Number.isInteger(im.height) && im.width > 0 && im.height > 0)) throw Error('Invalid project');
        ids.add(project.id);
      }
      root.PORTFOLIO_PROJECTS = body.projects;
      root.PORTFOLIO_SETTINGS = body.settings || {};
      root.PORTFOLIO_CONTENT_AVAILABLE = true;
    } catch { root.PORTFOLIO_CONTENT_AVAILABLE = false; }
    finally { clearTimeout(timer); }
  }
  function detail(project) {
    const text = (selector, value) => { const el = document.querySelector(selector); if (el) el.textContent = value; };
    text('.project-detail-title', project.title);
    text('.top-ticker-content > div:first-child > span:last-child', project.title);
    text('.project-detail-category', project.label);
    text('.project-hero-panel .project-summary-box', project.details?.summary || project.description);
    const tag = document.querySelector('.project-num-tag');
    if (tag) tag.innerHTML = 'PROJECT <span data-project-number>' + pad(root.PORTFOLIO_PROJECTS.indexOf(project) + 1) + '</span> &nbsp;●&nbsp; <span data-gallery-count>' + project.images.length + '</span> VISUALS &nbsp;●&nbsp; ' + escape(project.category.toUpperCase());
    const fields = ['brief', 'direction', 'role'];
    document.querySelectorAll('.project-meta-grid .meta-box').forEach((el, index) => {
      const value = project.details?.[fields[index]];
      if (value !== undefined) { el.hidden = !value; el.querySelector('.meta-value').textContent = value; }
    });
    const workflow = document.querySelector('.project-disclosure-banner');
    if (workflow && project.details) { workflow.hidden = !project.details.workflow; if (project.details.workflow) workflow.querySelector('div').textContent = project.details.workflow; }
    const badge = document.querySelector('.project-title-row > .pill-tag');
    if (badge) { badge.textContent = project.category.toUpperCase(); badge.className = 'pill-tag ' + project.color; }
    document.title = project.title + ' | Essam Adel Portfolio';
    document.querySelector('meta[name="description"]')?.setAttribute('content', project.details?.summary || project.description);
    const metadata = { 'og:title': project.share?.title || project.title + ' | Essam Adel', 'og:image': new URL(project.share?.image || project.cover, location.href).href, 'og:description': project.share?.description || project.description, 'og:url': new URL(project.url, location.href).href };
    for (const [property, value] of Object.entries(metadata)) { let el = document.querySelector('meta[property="' + property + '"]'); if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.append(el); } el.setAttribute('content', value); }
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', new URL(project.url, location.href).href);
    const info=document.querySelector('.project-detail-title')?.parentElement;if(info&&!document.getElementById('copyProjectShare')){const button=document.createElement('button');button.id='copyProjectShare';button.type='button';button.className='copy-project-share';button.textContent='Copy project link';button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('https://essam-portfolio-metrics.rubyplume16385.chatgpt.site/share/'+project.id);button.textContent='Link copied';setTimeout(()=>button.textContent='Copy project link',2500);}catch{button.textContent='Please allow clipboard access';}});info.append(button);}
    document.querySelector('[data-project-loading]')?.remove();
    document.querySelectorAll('[data-dynamic-project-content]').forEach(el => { el.hidden = false; });
  }
  function applySettings(projects){
    const s=root.PORTFOLIO_SETTINGS;if(!s)return;
    const text=(selector,value)=>{const el=document.querySelector(selector);if(el&&typeof value==='string')el.textContent=value;};
    text('.hero-tagline',s.heroTagline);text('.about-headline',s.aboutHeadline);text('.contact-hero-sub',s.contactIntro);
    const about=document.querySelector('.about-body-text');if(about&&Array.isArray(s.aboutParagraphs))about.innerHTML=s.aboutParagraphs.map(p=>'<p>'+escape(p)+'</p>').join('');
    const heading=document.querySelector('.contact-hero-title');if(heading&&s.contactHeading&&heading.textContent.trim().replace(/\s+/g,' ')!==s.contactHeading)heading.textContent=s.contactHeading;
    const services=document.querySelector('.services-grid');if(services&&Array.isArray(s.services))services.innerHTML=s.services.map((item,i)=>'<div class="service-card '+escape(item.color)+'"><div><div class="service-icon-box">'+pad(i+1)+'</div><h3 class="service-title">'+escape(item.title)+'</h3><p class="service-desc">'+escape(item.description)+'</p></div><span class="pill-tag white" style="margin-top:16px;align-self:flex-start">'+escape(item.tag)+'</span></div>').join('');
    const links=document.querySelector('.contact-rows-list');if(links&&Array.isArray(s.contactLinks))links.innerHTML=s.contactLinks.filter(link=>/^(https:\/\/|mailto:|tel:)/.test(link.url)).map(link=>'<a href="'+escape(link.url)+'" class="contact-row-card '+escape(link.color)+'" data-contact-channel="'+escape(['instagram','behance','email','phone','whatsapp'].includes(link.id)?link.id:'other')+'"'+(link.url.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':'')+'><span class="contact-row-label">'+escape(link.label)+'</span><span class="contact-row-value"><span>'+escape(link.display)+'</span></span></a>').join('');
    if(document.querySelector('.project-bars-list')){if(s.seoTitle)document.title=s.seoTitle;for(const [selector,value]of [['meta[name="description"]',s.seoDescription],['meta[property="og:title"]',s.seoTitle],['meta[property="og:description"]',s.seoDescription]])if(value)document.querySelector(selector)?.setAttribute('content',value);}
    const p=projects.find(p=>p.id===s.featuredProjectId),frame=document.querySelector('.hero-image-wrap');if(p&&frame){const im=p.images.find(im=>im.src===p.cover)||{src:p.cover};frame.innerHTML='<a href="'+escape(p.url)+'" aria-label="'+escape(p.title)+'"><img src="'+escape(imageSource(im))+'" alt="'+escape(p.title)+'" fetchpriority="high" decoding="async"></a>';text('.hero-image-caption-bar > span:first-child',p.title);}
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
    applySettings(projects);
    const projectGallery = document.querySelector('[data-project-gallery]');
    if (projectGallery) {
      const dynamicId = projectGallery.dataset.projectGallery === 'dynamic' ? new URLSearchParams(location.search).get('id') : null;
      const project = projects.find(p => dynamicId ? p.id === dynamicId : p.url === projectGallery.dataset.projectGallery);
      if (project) {
        detail(project);
        projectGallery.innerHTML = gallery(project);
        document.querySelectorAll('[data-gallery-count]').forEach(el => { el.textContent = project.images.length; });
        const index = projects.indexOf(project);
        document.querySelectorAll('[data-project-number]').forEach(el => { el.textContent = pad(index + 1); });
        document.querySelectorAll('.page-nav-link.prev, .page-nav-link.next').forEach(link => {
          const previous = link.classList.contains('prev');
          const neighborIndex = (index + (previous ? -1 : 1) + projects.length) % projects.length;
          const neighbor = projects[neighborIndex];
          link.setAttribute('href', neighbor.url);
          const label = link.hasAttribute('aria-label')
            ? (previous ? '← Previous Project' : 'Next Project →')
            : `${pad(neighborIndex + 1)}. ${neighbor.navTitle || neighbor.title}`;
          link.textContent = link.hasAttribute('aria-label') ? label : previous ? `← ${label}` : `${label} →`;
        });
      } else if (projectGallery.dataset.projectGallery === 'dynamic') {
        const loading = document.querySelector('[data-project-loading]');
        if (loading) loading.textContent = root.PORTFOLIO_CONTENT_AVAILABLE ? 'Project not found. Browse all selected work below.' : 'The project could not be loaded. Please refresh the page.';
      }
    }
  }
  const api = { summary, bars, cards, gallery, load, init, applySettings };
  root.Portfolio = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
