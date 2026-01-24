// Dynamic copyright year and Modern Interactions
document.addEventListener('DOMContentLoaded', function () {
    // 1. Dynamic Copyright Year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // 2. Active State for Navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidenav a');

    navLinks.forEach(link => {
        // Get the href attribute (e.g., "index.html")
        const href = link.getAttribute('href');

        // precise matching or strict "index.html" matching for root
        if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 3. Dynamic Greeting (only on Home page)
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

    // 4. Dynamic Projects Loading (only on Projects page)
    if (window.location.pathname.endsWith('projects.html')) {
        loadProjects();
    }

    // 5. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Target all sections for animation
    const sections = document.querySelectorAll('section, article, .tech-badges, .project-card');
    sections.forEach(section => {
        observer.observe(section);
    });
});

async function loadProjects() {
    const mainContainer = document.querySelector('.main');
    if (!mainContainer) return;

    // Clean up existing static content, but keep H1 and P
    // We can identify where to insert the new grid. Active "modernization" likely implies
    // we want to replace the hardcoded list with the dynamic one.

    // Strategy: Find the <p> tag that says "Some of my projects!" and append after it.
    // Or just clear everything after the H1/P and append.

    // Let's gather all 'a' tags that are direct children of .main and 'br' tags and remove them
    // to "clear" the old list without touching the header.
    const children = Array.from(mainContainer.children);
    let keepHeader = true;

    // Remove old links and line breaks, essentially clearing the "list" part
    children.forEach(child => {
        if (child.tagName === 'A' || child.tagName === 'BR') {
            child.remove();
        }
    });

    // Create container for new grid
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    grid.innerHTML = '<div class="loading-message">Loading projects from GitHub...</div>';
    mainContainer.appendChild(grid);

    try {
        const username = 'Project516';
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status}`);
        }

        const repos = await response.json();

        // Clear loading message
        grid.innerHTML = '';

        // Filter out forks if desired, or maybe just special ones? 
        // User has "Mirrors I made" in original HTML, so forks might be relevant?
        // Let's include everything but maybe visually distinguish or just show all.
        // User request: "list them so i dont have to update the page" implies listing ALL or most.

        if (repos.length === 0) {
            grid.innerHTML = '<div class="error-message">No public repositories found.</div>';
            return;
        }

        repos.forEach(repo => {
            const card = document.createElement('a');
            card.href = repo.html_url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.className = 'project-card';

            // Format date
            const date = new Date(repo.updated_at).toLocaleDateString();

            card.innerHTML = `
                <div>
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available.'}</p>
                </div>
                <div class="project-meta">
                    <span>${repo.language || 'Code'}</span>
                    <span>★ ${repo.stargazers_count}</span>
                    <span>Updated: ${date}</span>
                </div>
            `;

            grid.appendChild(card);
        });

        // Make sure new elements are observed for animation
        const newCards = document.querySelectorAll('.project-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Add a tiny delay based on index for staggered effect?
                    // Simplified for now.
                }
            });
        });
        newCards.forEach(card => observer.observe(card));

    } catch (error) {
        console.error('Failed to load projects:', error);
        grid.innerHTML = `
            <div class="error-message">
                Failed to load projects from GitHub.<br>
                <small>${error.message}</small><br>
                <a href="https://github.com/Project516" target="_blank" style="margin-top:1rem; display:inline-block;">View on GitHub</a>
            </div>
        `;
    }
}
