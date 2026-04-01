(function () {
    var now = new Date();
    var isAprilFirst = now.getMonth() === 3 && now.getDate() === 1;
    var shouldEnable = isAprilFirst;

    window.__APRIL_FOOLS_STATE__ = {
        isAprilFirst: isAprilFirst,
        enabled: shouldEnable
    };

    if (!shouldEnable) {
        return;
    }

    var currentScript = document.currentScript;
    var scriptDir = 'sixseven/';

    if (currentScript && currentScript.src) {
        var lastSlash = currentScript.src.lastIndexOf('/');
        if (lastSlash !== -1) {
            scriptDir = currentScript.src.slice(0, lastSlash + 1);
        }
    }

    document.documentElement.setAttribute('data-april-fools', 'on');

    var script = document.createElement('script');
    script.async = false;
    script.src = scriptDir + 'sigma.js';
    document.head.appendChild(script);
})();