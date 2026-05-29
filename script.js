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
            link.setAttribute('aria-current', 'page');
        }
    });

    if (window.location.pathname.endsWith('projects.html')) {
        loadProjects();
    }

    // Blog search filter
    if (window.location.pathname.endsWith('blog.html')) {
        const searchInput = document.getElementById('blog-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                const query = this.value.toLowerCase().trim();
                document.querySelectorAll('article').forEach(article => {
                    const title = article.querySelector('h2')?.textContent.toLowerCase() || '';
                    const excerpt = article.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';
                    article.hidden = query !== '' && !title.includes(query) && !excerpt.includes(query);
                });
                document.querySelectorAll('.year-heading').forEach(heading => {
                    let next = heading.nextElementSibling;
                    let hasVisible = false;
                    while (next && !next.classList.contains('year-heading')) {
                        if (next.tagName === 'ARTICLE' && !next.hidden) {
                            hasVisible = true;
                            break;
                        }
                        next = next.nextElementSibling;
                    }
                    heading.hidden = !hasVisible;
                });
            });
        }
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

    let articleIdx = 0;
    document.querySelectorAll('section, article, .tech-badges').forEach(el => {
        el.setAttribute('data-animate', '');
        if (el.tagName === 'ARTICLE') {
            el.style.transitionDelay = Math.min(articleIdx * 60, 300) + 'ms';
            articleIdx++;
        }
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
    grid.setAttribute('role', 'status');
    grid.setAttribute('aria-live', 'polite');

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading-message';
    loadingMsg.textContent = 'Loading projects from GitHub...';
    grid.appendChild(loadingMsg);
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
            const noResults = document.createElement('div');
            noResults.className = 'error-message';
            noResults.textContent = 'No public repositories found.';
            grid.appendChild(noResults);
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

            const innerDiv = document.createElement('div');

            const h3 = document.createElement('h3');
            h3.textContent = repo.name;

            const p = document.createElement('p');
            p.textContent = repo.description || 'No description available.';

            innerDiv.appendChild(h3);
            innerDiv.appendChild(p);

            const metaDiv = document.createElement('div');
            metaDiv.className = 'project-meta';

            const langSpan = document.createElement('span');
            langSpan.textContent = repo.language || 'Code';

            const starsSpan = document.createElement('span');
            starsSpan.textContent = '★ ' + repo.stargazers_count;

            const dateStr = new Date(repo.updated_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const dateSpan = document.createElement('span');
            dateSpan.textContent = 'Updated: ' + dateStr;

            metaDiv.appendChild(langSpan);
            metaDiv.appendChild(starsSpan);
            metaDiv.appendChild(dateSpan);

            card.appendChild(innerDiv);
            card.appendChild(metaDiv);
            grid.appendChild(card);
            cardObserver.observe(card);
        });

    } catch (error) {
        console.error('Failed to load projects:', error);
        grid.innerHTML = '';

        const errMsg = document.createElement('div');
        errMsg.className = 'error-message';

        const errText = document.createTextNode('Failed to load projects from GitHub.');
        errMsg.appendChild(errText);
        errMsg.appendChild(document.createElement('br'));

        const errLink = document.createElement('a');
        errLink.href = 'https://github.com/Project516';
        errLink.target = '_blank';
        errLink.rel = 'noopener noreferrer';
        errLink.textContent = 'View repositories on GitHub';
        errLink.className = 'error-fallback-link';
        errMsg.appendChild(errLink);

        grid.appendChild(errMsg);
    }
}
