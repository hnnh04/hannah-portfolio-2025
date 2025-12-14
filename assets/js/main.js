/* ---------------------------------------------------------
   MOBILE NAVIGATION TOGGLE
--------------------------------------------------------- */

const toggleButton = document.getElementsByClassName("toggle-button")[0];
const listContainer = document.getElementsByClassName("list-container")[0];

if (toggleButton && listContainer) {
    toggleButton.addEventListener("click", () => {
        listContainer.classList.toggle("active");
    });
}

/* ---------------------------------------------------------
   SMOOTH SCROLL FOR INTERNAL LINKS
--------------------------------------------------------- */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return; // z.B. bei externen Links mit #
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

/* ---------------------------------------------------------
   SCROLL TO TOP BUTTON
--------------------------------------------------------- */

const scrollToTopButton = document.getElementById('scrollToTop');

if (scrollToTopButton) {
    window.addEventListener('scroll', () => {
        scrollToTopButton.style.display = window.pageYOffset > 300 ? 'block' : 'none';
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---------------------------------------------------------
   PROJECT SYSTEM (JSON + FILTER + STARTSEITE + MODAL)
--------------------------------------------------------- */

const PROJECTS_JSON_PATH = 'data/projects.json';
let allProjects = [];

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects().then(() => {
        renderLatestProjects();   // Startseite (wenn vorhanden)
        renderProjectGrid();      // Projektseite (wenn vorhanden)
        setupFilters();           // Filter-Knöpfe
        initProjectModal();       // Modal-Logik
    });

    setupIllustrationWink();     // About-Illustration
});

/* ---------------------------------------------------------
   JSON LADEN
--------------------------------------------------------- */

async function fetchProjects() {
    try {
        const response = await fetch(PROJECTS_JSON_PATH);
        if (!response.ok) throw new Error('Konnte projects.json nicht laden');

        const data = await response.json();

        // Neueste zuerst
        allProjects = data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
    }
}

/* ---------------------------------------------------------
   STARTSEITE: LETZTE 3 PROJEKTE
--------------------------------------------------------- */

function renderLatestProjects() {
    const container = document.getElementById('latest-projects-list');
    if (!container || !allProjects.length) return;

    container.innerHTML = '';

    const latest = allProjects.slice(0, 3);

    latest.forEach(project => {
        const card = document.createElement('article');
        card.classList.add('project-card', 'project-card--compact');

        card.innerHTML = `
            <div class="project-card-image">
                <img src="${project.coverImage}" alt="${project.title}">
            </div>
            <div class="project-card-content">
                <span class="project-pill">${formatType(project.type)} · ${project.year}</span>
                <h3>${project.title}</h3>
                <p>${project.shortDescription}</p>
                <button class="project-link project-details"
                        data-project-id="${project.id}">
                    Projekt ansehen
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

/* ---------------------------------------------------------
   PROJEKTSEITE: GRID MIT FILTER
--------------------------------------------------------- */

function renderProjectGrid(filterType = 'all') {
    const grid = document.getElementById('project-grid');
    if (!grid || !allProjects.length) return;

    grid.innerHTML = '';

    const filtered = allProjects.filter(project => {
        return filterType === 'all' ? true : project.type === filterType;
    });

    filtered.forEach(project => {
        const card = document.createElement('article');
        card.classList.add('project-card');

        const tagsHtml = project.tags?.map(
            tag => `<span class="project-tag">${tag}</span>`
        ).join('') || "";

        card.innerHTML = `
            <div class="project-card-image">
                <img src="${project.coverImage}" alt="${project.title}">
            </div>
            <div class="project-card-content">
                <span class="project-pill">${formatType(project.type)} · ${project.year}</span>
                <h3>${project.title}</h3>
                <p>${project.shortDescription}</p>
                <div class="project-tags">
                    ${tagsHtml}
                </div>
                <button class="project-link project-details"
                        data-project-id="${project.id}">
                    Mehr erfahren
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

/* ---------------------------------------------------------
   FILTER-BUTTONS AKTIVIEREN
--------------------------------------------------------- */

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-button');
    if (!buttons.length) return;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            buttons.forEach(btn => btn.classList.remove('is-active'));
            button.classList.add('is-active');

            renderProjectGrid(filter);
        });
    });
}

/* ---------------------------------------------------------
   MODAL: ÖFFNEN / SCHLIESSEN
--------------------------------------------------------- */

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return; // z.B. auf Startseite ohne Modal

    document.addEventListener('click', (e) => {
        // „Mehr erfahren“ / „Projekt ansehen“
        const btn = e.target.closest('.project-details');
        if (btn) {
            const id = btn.dataset.projectId;
            openProjectModal(id);
            return;
        }

        // schließen über Overlay oder Close-Button
        if (
            e.target.matches('[data-close-modal]') ||
            e.target.closest('[data-close-modal]')
        ) {
            closeProjectModal();
        }
    });

    // ESC schließt Modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
}

function openProjectModal(projectId) {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const typeLabel = formatType(project.type);

    // Header
    const pill = document.getElementById('modal-pill');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');

    if (pill) pill.textContent = `${typeLabel} · ${project.year}`;
    if (title) title.textContent = project.title;
    if (subtitle) subtitle.textContent = project.subtitle || '';

    // Text
    const description = document.getElementById('modal-description');
    if (description) {
        description.textContent = project.longDescription || project.shortDescription;
    }

    const tagsContainer = document.getElementById('modal-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = project.tags?.map(
            tag => `<span class="project-tag">${tag}</span>`
        ).join('') || "";
    }

    const meta = document.getElementById('modal-meta');
    if (meta) {
        const metaParts = [];
        if (project.role)  metaParts.push(`Rolle: ${project.role}`);
        if (project.tools) metaParts.push(`Tools: ${project.tools}`);
        meta.textContent = metaParts.join(' · ');
    }

    // Media (YouTube / mp4 / Bilder)
    const mediaContainer = document.getElementById('modal-media');
    if (mediaContainer) {
        mediaContainer.innerHTML = '';

        // 1) YouTube / Embed
        if (project.videoEmbedUrl) {
            mediaContainer.innerHTML = `
                <div class="project-video-embed">
                    <iframe
                        src="${project.videoEmbedUrl}"
                        title="${project.title}"
                        loading="lazy"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        }

        // 2) Lokales Video (mp4) – optional
        else if (project.images && project.images.length > 0 && project.images[0].endsWith('.mp4')) {
            mediaContainer.innerHTML = `
                <video controls>
                    <source src="${project.images[0]}" type="video/mp4">
                    Dein Browser unterstützt das Video-Tag nicht.
                </video>
            `;
        }

        // 3) Bilder-Slider
        else if (project.images && project.images.length > 0) {
            const images = project.images;
            const imagesPerPage = 3;
            const totalPages = Math.ceil(images.length / imagesPerPage);

            let currentPage = 0;

            mediaContainer.innerHTML = `
                <div class="project-modal-media-slider">
                    <div class="project-modal-media-track"></div>
                    <div class="project-modal-media-nav">
                        <button type="button" class="slider-prev">Zurück</button>
                        <span class="slider-counter"></span>
                        <button type="button" class="slider-next">Weiter</button>
                    </div>
                </div>
            `;

            const track = mediaContainer.querySelector('.project-modal-media-track');
            const prevBtn = mediaContainer.querySelector('.slider-prev');
            const nextBtn = mediaContainer.querySelector('.slider-next');
            const counter = mediaContainer.querySelector('.slider-counter');

            function renderPage(pageIndex) {
                const start = pageIndex * imagesPerPage;
                const end = start + imagesPerPage;
                const pageImages = images.slice(start, end);

                track.innerHTML = '';

                pageImages.forEach(src => {
                    const slide = document.createElement('div');
                    slide.classList.add('project-slide');
                    slide.innerHTML = `<img src="${src}" alt="${project.title}">`;
                    track.appendChild(slide);
                });

                counter.textContent = `${start + 1}–${Math.min(end, images.length)} / ${images.length}`;

                prevBtn.disabled = pageIndex === 0;
                nextBtn.disabled = pageIndex >= totalPages - 1;
            }

            prevBtn.onclick = () => {
                if (currentPage > 0) {
                    currentPage--;
                    renderPage(currentPage);
                }
            };

            nextBtn.onclick = () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    renderPage(currentPage);
                }
            };

            renderPage(currentPage);
        }
    }

    // Modal anzeigen (das hattest du vorher drin, ist wichtig)
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
}



function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
}

/* ---------------------------------------------------------
   HILFSFUNKTION: TYPE FORMATIEREN
--------------------------------------------------------- */

function formatType(type) {
    switch (type) {
        case 'design': return 'Design';
        case 'foto':   return 'Fotografie';
        case 'film':   return 'Film';
        case '3d':   return '3d';
        default:       return type;
    }
}

/* ---------------------------------------------------------
   ABOUT-ILLUSTRATION (ZWINKERN)
--------------------------------------------------------- */

function setupIllustrationWink() {
    const illustration = document.getElementById('about-illustration');
    if (!illustration) return;

    const baseSrc = 'assets/img/illustration.png';

    const variantSrcs = [
        'assets/img/illustration-wink1.png',
        'assets/img/illustration-wink2.png',
        'assets/img/illustration-wink3.png',
        'assets/img/illustration-wink4.png'
    ];

    illustration.addEventListener('mouseenter', () => {
        const randomIndex = Math.floor(Math.random() * variantSrcs.length);
        const randomSrc = variantSrcs[randomIndex];
        illustration.src = randomSrc;
    });

    illustration.addEventListener('mouseleave', () => {
        illustration.src = baseSrc;
    });
}
