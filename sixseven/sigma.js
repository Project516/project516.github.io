(function () {
    if (!document.documentElement.getAttribute('data-april-fools')) {
        return;
    }

    var replacements = [
        { pattern: /\bwebsite\b/gi, value: 'site' },
        { pattern: /\bblog\b/gi, value: 'feed' },
        { pattern: /\bprojects\b/gi, value: 'builds' },
        { pattern: /\bproject\b/gi, value: 'build' },
        { pattern: /\bdeveloper\b/gi, value: 'dev' },
        { pattern: /\btechnology\b/gi, value: 'tech' },
        { pattern: /\bopen source\b/gi, value: 'open-source' },
        { pattern: /\bguide\b/gi, value: 'guide' },
        { pattern: /\bhello\b/gi, value: 'yo' },
        { pattern: /\bwelcome\b/gi, value: "what's good" },
        { pattern: /\bconnect\b/gi, value: 'tap in' },
        { pattern: /\bgood\b/gi, value: 'valid' },
        { pattern: /\bgreat\b/gi, value: 'goated' },
        { pattern: /\bamazing\b/gi, value: 'so fire' },
        { pattern: /\bbad\b/gi, value: 'chopped' },
        { pattern: /\bawesome\b/gi, value: 'aura' },
        { pattern: /\bcool\b/gi, value: 'sick' },
        { pattern: /\bimprove\b/gi, value: 'looksmax' }
    ];

    var openers = [
        'Yo',
        'Low-key',
        'Not gonna lie',
        'Yeah yeah',
        'Nah chill',
        'Bro',
        'Fellas',
        "What's good"
    ];

    var endings = [
        "that's crazy though?",
        'bro.',
        'dawg.',
        'sheesh!',
        'ayo, no Diddy.',
        "that's fire.",
        "that's sick.",
        'goated.',
        'valid.',
        'fire.',
        'dub.',
        'facts.',
        'unc vibes.',
        'thick.',
        'scaring the huzz.',
        'zesty.',
        'bet.',
        'six seven'
    ];

    var fillers = [
        'low-key',
        'not gonna lie',
        'facts',
        'no Diddy, pause',
        'that is wild',
        'yo'
    ];

    var shortSuffixes = [
        ' yo',
        ' low-key',
        ' fr',
        ' bro',
        ' dawg',
        ' valid',
        ' bet'
    ];

    var looksmaxTags = [
        'unprecedented levels of aura',
        'rizz is maxed',
        'mewing arc active',
        'mogging low-key',
        'gigachad posture',
        'mandibular buff unlocked',
        'looksmax in progress'
    ];

    function keepCase(original, replacement) {
        if (original === original.toUpperCase()) {
            return replacement.toUpperCase();
        }
        if (original.charAt(0) === original.charAt(0).toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
    }

    function normalizeSpacing(text) {
        return text.replace(/\s{2,}/g, ' ').trim();
    }

    function hashString(input) {
        var hash = 2166136261;
        for (var i = 0; i < input.length; i += 1) {
            hash ^= input.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return hash >>> 0;
    }

    function createRng(seed) {
        var state = seed >>> 0;
        return function () {
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }

    function pick(list, rng) {
        var idx = Math.floor(rng() * list.length);
        return list[idx];
    }

    function decorateSentence(sentence, index) {
        var base = normalizeSpacing(sentence);
        if (!base) {
            return sentence;
        }

        if (!/[a-z]/i.test(base)) {
            return sentence;
        }

        var wordCount = (base.match(/\b[\w'-]+\b/g) || []).length;
        var rng = createRng(hashString(base + '|' + index));

        if (wordCount <= 3) {
            if (rng() < 0.45) {
                base += pick(shortSuffixes, rng);
            }
            return base;
        }

        var needsOpener = !/^(yo|low-key|not gonna lie|yeah yeah|nah chill|bro|fellas|what's good)\b/i.test(base);
        if (needsOpener && rng() < 0.5) {
            base = pick(openers, rng) + ', ' + base;
        }

        if (rng() < 0.35) {
            base += ', ' + pick(fillers, rng);
        }

        if (rng() < 0.25) {
            base += ', ' + pick(fillers, rng);
        }

        if (rng() < 0.3) {
            base += ', ' + pick(looksmaxTags, rng);
        }

        if (rng() < 0.6) {
            base += ', ' + pick(endings, rng);
        }

        return base;
    }

    function brainrotify(text) {
        var result = text;
        for (var i = 0; i < replacements.length; i += 1) {
            var item = replacements[i];
            result = result.replace(item.pattern, function (match) {
                return keepCase(match, item.value);
            });
        }

        result = result.replace(/\bvery\b/gi, 'mad');
        result = result.replace(/\breally\b/gi, 'low-key');
        result = result.replace(/\bplease\b/gi, 'yo please');

        var parts = result.match(/[^.!?]+[.!?]?/g);
        if (parts && parts.length > 0) {
            var out = [];
            for (var p = 0; p < parts.length; p += 1) {
                var part = parts[p];
                if (part.trim().length < 3) {
                    out.push(part);
                    continue;
                }
                out.push(decorateSentence(part, p));
            }
            result = out.join(' ');
        }

        result = result.replace(/\?+/g, '?');
        result = result.replace(/!+/g, '!!');
        result = result.replace(/\s+,/g, ',');
        result = result.replace(/\s{2,}/g, ' ');
        return result;
    }

    function shouldSkipNode(parent) {
        if (!parent || !parent.tagName) {
            return true;
        }
        var blockedTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA'];
        return blockedTags.indexOf(parent.tagName) !== -1;
    }

    function mutateTextNodes() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var nodes = [];

        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }

        for (var i = 0; i < nodes.length; i += 1) {
            var node = nodes[i];
            var value = node.nodeValue;
            if (!value || value.trim().length < 3 || shouldSkipNode(node.parentElement)) {
                continue;
            }
            node.nodeValue = brainrotify(value);
        }
    }

    function mutateVisibleAttributes() {
        var selector = '[title], [aria-label], input[placeholder], textarea[placeholder], img[alt]';
        var elements = document.querySelectorAll(selector);

        for (var i = 0; i < elements.length; i += 1) {
            var el = elements[i];
            var attrNames = ['title', 'aria-label', 'placeholder', 'alt'];

            for (var j = 0; j < attrNames.length; j += 1) {
                var attr = attrNames[j];
                var value = el.getAttribute(attr);
                if (value && value.trim().length >= 3) {
                    el.setAttribute(attr, brainrotify(value));
                }
            }
        }
    }

    function run() {
        mutateTextNodes();
        mutateVisibleAttributes();
        if (document.title) {
            document.title = brainrotify(document.title);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
