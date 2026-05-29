document.addEventListener('DOMContentLoaded', function () {

    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidenav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        const introSection = document.querySelector('.about-intro h2');
        if (introSection) {
            const hour = new Date().getHours();
            let greeting = 'Hello';
            if (hour < 12) greeting = 'Good Morning';
            else if (hour < 18) greeting = 'Good Afternoon';
            else greeting = 'Good Evening';

            if (introSection.textContent.includes("Hi, I'm")) {
                introSection.textContent = introSection.textContent.replace("Hi", greeting);
            }
        }
    }

    if (window.location.pathname.endsWith('projects.html')) {
        loadProjects();
    }

    // Scroll reveal — data-animate added here so content is always visible without JS.
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, article, .tech-badges').forEach(el => {
        el.setAttribute('data-animate', '');
        observer.observe(el);
    });
});

async function loadProjects() {
    const mainContainer = document.querySelector('.main');
    if (!mainContainer) return;

    const staticList = mainContainer.querySelector('.static-projects');
    if (staticList) staticList.remove();

    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    grid.innerHTML = '<div class="loading-message">Loading projects from GitHub...</div>';
    mainContainer.appendChild(grid);

    try {
        const CACHE_KEY = 'p516_repos';
        const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

        let repos = null;

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, ts } = JSON.parse(cached);
                if (Date.now() - ts < CACHE_TTL) {
                    repos = data;
                }
            }
        } catch (_) {
            // localStorage unavailable; will fetch fresh
        }

        if (!repos) {
            const response = await fetch('https://api.github.com/users/Project516/repos?sort=updated&per_page=100');

            if (!response.ok) {
                throw new Error(`Could not load projects (HTTP ${response.status})`);
            }

            repos = await response.json();

            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ data: repos, ts: Date.now() }));
            } catch (_) {
                // localStorage write failed; continue without caching
            }
        }

        grid.innerHTML = '';

        if (repos.length === 0) {
            grid.innerHTML = '<div class="error-message">No public repositories found.</div>';
            return;
        }

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        repos.forEach(repo => {
            const card = document.createElement('a');
            card.href = repo.html_url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.className = 'project-card';
            card.setAttribute('data-animate', '');

            const date = new Date(repo.updated_at).toLocaleDateString();

            card.innerHTML = `
                <div>
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available.'}</p>
                </div>
                <div class="project-meta">
                    <span>${repo.language || 'Code'}</span>
                    <span>&#9733; ${repo.stargazers_count}</span>
                    <span>Updated: ${date}</span>
                </div>
            `;

            grid.appendChild(card);
            cardObserver.observe(card);
        });

    } catch (error) {
        console.error('Failed to load projects:', error);
        grid.innerHTML = `
            <div class="error-message">
                Failed to load projects from GitHub.
                <br>
                <a href="https://github.com/Project516" target="_blank" rel="noopener noreferrer" style="margin-top:1rem; display:inline-block;">View repositories on GitHub</a>
            </div>
        `;
    }
}
