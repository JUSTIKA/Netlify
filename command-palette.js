/* Command palette (⌘K / Ctrl+K) — shared across every page.
   Self-contained: injects its own trigger button and dialog markup,
   no per-page HTML required. Pure progressive enhancement — every
   destination here is also reachable through normal links/nav. */
(function () {
    var ITEMS = [
        { label: 'About', hint: 'Section', href: 'index.html#about' },
        { label: 'Projects', hint: 'Section', href: 'index.html#projects' },
        { label: 'Experience', hint: 'Section', href: 'index.html#experience' },
        { label: 'Links', hint: 'Section', href: 'index.html#links' },
        { label: "Form'Annonce", hint: 'Project', href: 'formannonce.html' },
        { label: 'Drone Defense Hackathon', hint: 'Project', href: 'hackathon.html' },
        { label: 'Drone Porteur', hint: 'Project', href: 'DP.html' },
        { label: 'RoboCup SSL · VisionBlackOut', hint: 'Project', href: 'rocobup.html' },
        { label: 'FirstBot · Autonomous Line Follower', hint: 'Project', href: 'firstbot.html' },
        { label: 'LinkedIn', hint: 'External', href: 'https://www.linkedin.com/in/joao-fernandes-lopes-a25812245/', external: true },
        { label: 'GitHub', hint: 'External', href: 'https://github.com/JUSTIKA', external: true },
        { label: 'Curriculum Vitae', hint: 'PDF', href: 'images/CV.pdf', external: true }
    ];

    function init() {
        var sidebarFooter = document.querySelector('.sidenav-footer');
        var overlay = document.createElement('div');
        overlay.className = 'cmdk-overlay';
        overlay.hidden = true;
        overlay.innerHTML =
            '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Quick navigation">' +
                '<div class="cmdk-input-row">' +
                    '<span class="cmdk-icon">⌘K</span>' +
                    '<input type="text" class="cmdk-input" placeholder="Jump to a section or project…" autocomplete="off" spellcheck="false">' +
                '</div>' +
                '<ul class="cmdk-list"></ul>' +
                '<div class="cmdk-footer"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div>' +
            '</div>';
        document.body.appendChild(overlay);

        var input = overlay.querySelector('.cmdk-input');
        var list = overlay.querySelector('.cmdk-list');
        var activeIndex = 0;
        var filtered = ITEMS.slice();
        var lastFocused = null;

        function render() {
            list.innerHTML = '';
            if (!filtered.length) {
                var empty = document.createElement('div');
                empty.className = 'cmdk-empty';
                empty.textContent = 'No matches';
                list.appendChild(empty);
                return;
            }
            filtered.forEach(function (item, i) {
                var li = document.createElement('li');
                li.className = 'cmdk-item' + (i === activeIndex ? ' is-active' : '');
                li.innerHTML = '<span>' + item.label + '</span><span class="cmdk-hint">' + item.hint + '</span>';
                li.addEventListener('mouseenter', function () { activeIndex = i; render(); });
                li.addEventListener('click', function () { go(item); });
                list.appendChild(li);
            });
        }

        function go(item) {
            close();
            if (item.external) {
                window.open(item.href, '_blank', 'noopener');
            } else {
                window.location.href = item.href;
            }
        }

        function open() {
            lastFocused = document.activeElement;
            overlay.hidden = false;
            input.value = '';
            filtered = ITEMS.slice();
            activeIndex = 0;
            render();
            input.focus();
        }

        function close() {
            overlay.hidden = true;
            if (lastFocused && lastFocused.focus) lastFocused.focus();
        }

        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            filtered = q ? ITEMS.filter(function (item) { return item.label.toLowerCase().indexOf(q) !== -1; }) : ITEMS.slice();
            activeIndex = 0;
            render();
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
            else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIndex]) go(filtered[activeIndex]); }
            else if (e.key === 'Escape') { e.preventDefault(); close(); }
        });

        overlay.addEventListener('mousedown', function (e) {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', function (e) {
            var combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
            if (combo) {
                e.preventDefault();
                if (overlay.hidden) open(); else close();
            } else if (e.key === 'Escape' && !overlay.hidden) {
                close();
            }
        });

        if (sidebarFooter) {
            var trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'cmdk-trigger';
            var isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
            trigger.innerHTML = 'Search <kbd>' + (isMac ? '⌘K' : 'Ctrl K') + '</kbd>';
            trigger.addEventListener('click', open);
            sidebarFooter.appendChild(trigger);
        }
    }

    function safeInit() {
        try { init(); } catch (e) { /* Non-essential enhancement. */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }
})();
