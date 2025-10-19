// Apply seasonal theme based on current month and handle dark mode
(function() {
    const currentMonth = new Date().getMonth(); // 0-indexed (0 = January, 9 = October, 11 = December)
    
    // October = Halloween theme (orange/black - automatically uses dark mode)
    if (currentMonth === 9) {
        document.body.classList.add('halloween-theme');
        document.body.classList.add('dark-mode');
        window.isHalloweenMode = true;
    } else {
        window.isHalloweenMode = false;
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
})();

// Toggle dark mode function
function toggleDarkMode() {
    // Don't allow toggling during Halloween month
    if (window.isHalloweenMode) {
        return;
    }
    
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}
