// Apply seasonal theme based on current month
(function() {
    const currentMonth = new Date().getMonth(); // 0-indexed (0 = January, 9 = October, 11 = December)
    
    // October = Halloween theme (orange/black)
    if (currentMonth === 9) {
        document.body.classList.add('halloween-theme');
    }
    
    // December = Christmas theme (red/green)
    if (currentMonth === 11) {
        document.body.classList.add('christmas-theme');
    }
})();
