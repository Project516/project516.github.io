// Blog post manifest — newest first. Update when adding new posts.
const BLOG_POSTS = [
    { slug: '05292026', title: 'retroview: 17,000 downloads!' },
    { slug: '04222026', title: 'retroview' },
    { slug: '02212026', title: 'Switching to SideStore' },
    { slug: '12212025', title: 'Happy Holidays!' },
    { slug: '11092025', title: 'Adnauseam' },
    { slug: '10282025', title: 'Fedora 43 released!' },
    { slug: '09302025', title: 'Minecraft 1.21.9' },
    { slug: '09292025', title: 'iOS Sideloading' },
    { slug: '08122025', title: 'My current browser!' },
    { slug: '03212025', title: 'Hello!' },
    { slug: '01252025', title: 'Switching to Firefox!' },
    { slug: '01202025', title: 'Super Mario 64 Hack Of The Year' },
    { slug: '01172025', title: 'Switch 2 got announced!' },
    { slug: '01012025', title: "Its 2025!!!" },
    { slug: '12312024', title: '1st Blog!' }
];

document.addEventListener('DOMContentLoaded', function () {

    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidenav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isBlogPost = currentPath.includes('/blogs/') && (href === 'blog.html' || href === '/blog.html');
        const isExactMatch = currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html');
        if (isExactMatch || isBlogPost) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    if (window.location.pathname.endsWith('projects.html')) {
        loadProjects();
    }

    // Breadcrumb and date on individual blog post pages
    if (window.location.pathname.includes('/blogs/')) {
        const mainDiv = document.querySelector('.main');
        if (mainDiv) {
            const breadcrumb = document.createElement('nav');
            breadcrumb.setAttribute('aria-label', 'Breadcrumb');
            breadcrumb.className = 'blog-breadcrumb';
            const backLink = document.createElement('a');
            backLink.href = '/blog.html';
            backLink.textContent = '← Blog';
            breadcrumb.appendChild(backLink);
            mainDiv.prepend(breadcrumb);

            // Inject date below h1, parsed from filename (MMDDYYYY.html)
            const match = window.location.pathname.match(/\/(\d{2})(\d{2})(\d{4})\.html$/);
            if (match) {
                const [, mm, dd, yyyy] = match;
                const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
                const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const h1 = mainDiv.querySelector('h1');
                if (h1) {
                    const meta = document.createElement('p');
                    meta.className = 'post-meta';
                    meta.appendChild(document.createTextNode('Posted on '));
                    const timeEl = document.createElement('time');
                    timeEl.setAttribute('datetime', `${yyyy}-${mm}-${dd}`);
                    timeEl.textContent = formatted;
                    meta.appendChild(timeEl);
                    meta.appendChild(document.createTextNode(' by project516'));
                    h1.after(meta);
                }

                // Prev/next navigation
                const currentSlug = mm + dd + yyyy;
                const idx = BLOG_POSTS.findIndex(p => p.slug === currentSlug);
                if (idx !== -1) {
                    const newer = idx > 0 ? BLOG_POSTS[idx - 1] : null;
                    const older = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null;
                    if (newer || older) {
                        const postnav = document.createElement('nav');
                        postnav.className = 'post-nav';
                        postnav.setAttribute('aria-label', 'Post navigation');
                        if (older) {
                            const a = document.createElement('a');
                            a.href = '/blogs/' + older.slug + '.html';
                            a.className = 'post-nav-older';
                            a.textContent = '← ' + older.title;
                            postnav.appendChild(a);
                        } else {
                            postnav.appendChild(document.createElement('span'));
                        }
                        if (newer) {
                            const a = document.createElement('a');
                            a.href = '/blogs/' + newer.slug + '.html';
                            a.className = 'post-nav-newer';
                            a.textContent = newer.title + ' →';
                            postnav.appendChild(a);
                        }
                        mainDiv.appendChild(postnav);
                    }
                }
            }
        }
    }

    // Blog search filter
    if (window.location.pathname.endsWith('blog.html')) {
        const searchInput = document.getElementById('blog-search-input');
        if (searchInput) {
            // Ensure empty-state element exists
            let noResultsEl = document.getElementById('blog-no-results');
            if (!noResultsEl) {
                noResultsEl = document.createElement('p');
                noResultsEl.id = 'blog-no-results';
                noResultsEl.hidden = true;
                noResultsEl.setAttribute('aria-live', 'polite');
                noResultsEl.textContent = 'No posts match your search.';
                searchInput.closest('.blog-search').after(noResultsEl);
            }

            searchInput.addEventListener('input', function () {
                const query = this.value.toLowerCase().trim();
                let anyVisible = false;
                document.querySelectorAll('article').forEach(article => {
                    const title = (article.querySelector('h3') || article.querySelector('h2'))?.textContent.toLowerCase() || '';
                    const excerpt = article.querySelector('.article-excerpt')?.textContent.toLowerCase() || '';
                    const show = query === '' || title.includes(query) || excerpt.includes(query);
                    article.hidden = !show;
                    if (show) anyVisible = true;
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
                noResultsEl.hidden = anyVisible || query === '';
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
    document.querySelectorAll('section, article').forEach(el => {
        el.setAttribute('data-animate', '');
        if (el.tagName === 'ARTICLE') {
            el.style.transitionDelay = Math.min(articleIdx * 60, 300) + 'ms';
            articleIdx++;
        }
        observer.observe(el);
    });
});

async function loadProjects() {
    const reposContainer = document.getElementById('github-repos');
    if (!reposContainer) return;

    // Clear the static fallback list
    reposContainer.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    grid.setAttribute('role', 'status');
    grid.setAttribute('aria-live', 'polite');

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading-message';
    loadingMsg.textContent = 'Loading projects from GitHub...';
    grid.appendChild(loadingMsg);
    reposContainer.appendChild(grid);

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
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            let response;
            try {
                response = await fetch('https://api.github.com/users/Project516/repos?sort=updated&per_page=100', {
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeout);
            }

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
