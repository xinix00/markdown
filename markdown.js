/*! @xinix00/markdown v1.0.0 | MIT | https://github.com/xinix00/markdown */
(function (global) {
    'use strict';

    // -----------------------------------------------------------------------
    // Block parsing — every line is a block, the prefix decides the style
    // -----------------------------------------------------------------------

    const RE = /^(#{1,3} |- |\d+\. |> |```)/;
    const TYPES = {
        '# ': ['h1', '#'], '## ': ['h2', '##'], '### ': ['h3', '###'],
        '- ': ['bullet', '•'], '> ': ['quote', null], '```': ['code', '</>'],
    };

    function parse(text) {
        const m = text.match(RE);
        const prefix = m ? m[1] : '';
        const content = prefix ? text.slice(prefix.length) : text;
        const t = TYPES[prefix];
        if (t) return { prefix, content, type: t[0], dec: t[1] };
        if (prefix) return { prefix, content, type: 'numbered', dec: prefix.trim() };
        return { prefix: '', content: text, type: 'p', dec: null };
    }

    // -----------------------------------------------------------------------
    // Toolbar — inline SVG icons (Lucide, ISC license)
    // -----------------------------------------------------------------------

    const ICONS = {
        bold: '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
        italic: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
        strike: '<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/>',
        h1: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>',
        h2: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>',
        h3: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>',
        bullet: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
        numbered: '<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>',
        quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
        code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
        paragraph: '<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>',
    };

    // [id, action, argument] — null = divider
    const TOOLBAR = [
        ['bold', 'wrap', '**'], ['italic', 'wrap', '*'], ['strike', 'wrap', '~~'], null,
        ['h1', 'setPrefix', '# '], ['h2', 'setPrefix', '## '], ['h3', 'setPrefix', '### '], null,
        ['bullet', 'setPrefix', '- '], ['numbered', 'setPrefix', '1. '], ['quote', 'setPrefix', '> '], null,
        ['code', 'setPrefix', '```'], ['paragraph', 'setPrefix', ''],
    ];

    const LABELS = {
        bold: 'Bold', italic: 'Italic', strike: 'Strikethrough',
        h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
        bullet: 'Bullet list', numbered: 'Numbered list', quote: 'Quote',
        code: 'Code', paragraph: 'Paragraph',
        placeholder: 'Type here…', text: 'text',
    };

    function icon(name) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = ICONS[name];
        return svg;
    }

    // Browsers without `field-sizing: content` need a JS auto-grow fallback
    const AUTO_GROW = !(global.CSS && CSS.supports && CSS.supports('field-sizing', 'content'));
    function fit(ta) {
        if (!AUTO_GROW) return;
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
    }

    // -----------------------------------------------------------------------
    // Component — Alpine.js data object (also usable via mount())
    // -----------------------------------------------------------------------

    function component(options) {
        const opts = Object.assign({ toolbar: true }, options || {});
        const labels = Object.assign({}, LABELS, opts.labels || {});
        if (opts.placeholder !== undefined) labels.placeholder = opts.placeholder;

        return {
            blocks: [], active: 0,
            selFrom: null, selTo: null, mouseDown: false, dragFrom: null,

            init() {
                const root = this.$el;
                root.classList.add('md-editor');
                root.setAttribute('tabindex', '-1'); // focusable for block-selection keys

                this.source = root.querySelector('textarea');
                if (!this.source) throw new Error('md-editor: no <textarea> inside root element');
                this.source.style.display = 'none';

                if (opts.toolbar) root.insertBefore(this.buildToolbar(), this.source);
                this.container = document.createElement('div');
                this.container.className = 'md-blocks';
                root.insertBefore(this.container, this.source);

                this.blocks = (this.source.value || '').split('\n');
                if (!this.blocks.length) this.blocks = [''];
                this.$nextTick(() => this.render(false));

                this._onMouseUp = () => { this.mouseDown = false; this.dragFrom = null; };
                document.addEventListener('mouseup', this._onMouseUp);

                this._onFocusOut = (e) => {
                    if (!root.contains(e.relatedTarget)) this.clearSelection();
                };
                root.addEventListener('focusout', this._onFocusOut);

                this._onKeyDown = (e) => {
                    if (this.selRange() && (e.key === 'Backspace' || e.key === 'Delete')) {
                        e.preventDefault();
                        this.deleteSelection();
                    }
                    if (e.key === 'Escape') this.clearSelection();
                };
                root.addEventListener('keydown', this._onKeyDown);
            },

            destroy() {
                document.removeEventListener('mouseup', this._onMouseUp);
                this.$el?.removeEventListener('focusout', this._onFocusOut);
                this.$el?.removeEventListener('keydown', this._onKeyDown);
            },

            buildToolbar() {
                const bar = document.createElement('div');
                bar.className = 'md-toolbar';
                TOOLBAR.forEach((item) => {
                    if (!item) {
                        const div = document.createElement('span');
                        div.className = 'md-divider';
                        bar.appendChild(div);
                        return;
                    }
                    const [id, action, arg] = item;
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.title = labels[id];
                    btn.setAttribute('aria-label', labels[id]);
                    btn.dataset.md = id;
                    btn.appendChild(icon(id));
                    btn.addEventListener('mousedown', (e) => e.preventDefault()); // keep textarea focus
                    btn.addEventListener('click', () => this[action](arg));
                    bar.appendChild(btn);
                });
                return bar;
            },

            render(autoFocus = true) {
                const c = this.container;
                c.innerHTML = '';
                this.blocks.forEach((text, i) => c.appendChild(this.buildBlock(text, i)));
                if (AUTO_GROW) c.querySelectorAll('textarea').forEach(fit);
                if (autoFocus) this.focus(this.active);
            },

            buildBlock(text, i) {
                const { prefix, content, type, dec } = parse(text);
                const isHeading = type[0] === 'h';

                const row = document.createElement('div');
                row.className = 'md-block md-' + type;

                if (dec !== null) {
                    const d = document.createElement('span');
                    d.className = 'md-decorator';
                    d.textContent = dec;
                    row.appendChild(d);
                }

                // Block selection: drag from one block to another selects the range
                row.addEventListener('mousedown', () => {
                    this.mouseDown = true;
                    this.dragFrom = i;
                });
                row.addEventListener('mouseenter', () => {
                    if (!this.mouseDown || this.dragFrom === null) return;
                    if (i !== this.dragFrom) {
                        this.selFrom = this.dragFrom;
                        this.selTo = i;
                        this.highlightSelection();
                        this.$el.focus();
                    }
                });

                const ta = document.createElement('textarea');
                ta.className = 'md-input';
                ta.value = content;
                ta.rows = 1;
                if (i === 0 && !content) ta.placeholder = labels.placeholder;

                ta.addEventListener('focus', () => {
                    this.active = i;
                    if (!this.mouseDown) this.clearSelection();
                });
                ta.addEventListener('input', () => {
                    fit(ta);
                    this.blocks[i] = prefix + ta.value;
                    this.sync();
                    // Auto-detect a freshly typed prefix (e.g. "- ")
                    const parsed = parse(prefix + ta.value);
                    if (parsed.prefix !== prefix && parsed.prefix) {
                        this.render();
                        this.$nextTick(() => this.focus(i, 'end'));
                    }
                });

                ta.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        if (e.shiftKey && !isHeading) return; // Shift+Enter = soft newline (not in headings)
                        e.preventDefault(); this.split(i, ta);
                    }
                    if (e.key === 'Backspace' && !ta.selectionStart && !ta.selectionEnd && i > 0) { e.preventDefault(); this.merge(i); }
                    if (e.key === 'ArrowUp' && !ta.selectionStart && i > 0) { e.preventDefault(); this.focus(i - 1, 'end'); }
                    if (e.key === 'ArrowDown' && ta.selectionStart === ta.value.length && i < this.blocks.length - 1) { e.preventDefault(); this.focus(i + 1, 'start'); }
                });

                ta.addEventListener('paste', (e) => {
                    const paste = e.clipboardData.getData('text');
                    if (!paste.includes('\n')) return;
                    e.preventDefault();
                    const before = ta.value.slice(0, ta.selectionStart), after = ta.value.slice(ta.selectionEnd);
                    const lines = paste.split('\n');
                    this.blocks[i] = prefix + before + lines[0];
                    const rest = lines.slice(1);
                    if (after) rest[rest.length - 1] += after;
                    this.blocks.splice(i + 1, 0, ...rest);
                    this.active = i + rest.length;
                    this.render(); this.sync();
                });

                row.appendChild(ta);
                return row;
            },

            split(i, ta) {
                const before = ta.value.slice(0, ta.selectionStart), after = ta.value.slice(ta.selectionStart);
                const { prefix } = parse(this.blocks[i]);
                const isList = prefix === '- ' || /^\d+\. /.test(prefix);

                this.blocks[i] = prefix + before;

                if (isList && !before.trim()) { this.blocks[i] = ''; this.blocks.splice(i + 1, 0, after); }
                else if (/^\d+\. /.test(prefix)) this.blocks.splice(i + 1, 0, (parseInt(prefix, 10) + 1) + '. ' + after);
                else if (prefix === '- ') this.blocks.splice(i + 1, 0, '- ' + after);
                else this.blocks.splice(i + 1, 0, after);

                this.active = i + 1; this.render(); this.sync();
            },

            merge(i) {
                const prev = parse(this.blocks[i - 1]), curr = parse(this.blocks[i]);
                const cursor = prev.content.length;
                this.blocks[i - 1] = prev.prefix + prev.content + curr.content;
                this.blocks.splice(i, 1);
                this.active = i - 1; this.render();
                this.$nextTick(() => {
                    const ta = this.ta(i - 1);
                    if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = cursor; }
                });
                this.sync();
            },

            wrap(syntax) {
                const ta = this.ta(this.active);
                if (!ta) return;
                const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || labels.text;
                ta.value = ta.value.slice(0, s) + syntax + sel + syntax + ta.value.slice(e);
                this.blocks[this.active] = parse(this.blocks[this.active]).prefix + ta.value;
                ta.selectionStart = ta.selectionEnd = s + syntax.length + sel.length + syntax.length;
                ta.focus(); fit(ta); this.sync();
            },

            setPrefix(p) {
                this.blocks[this.active] = p + parse(this.blocks[this.active]).content;
                this.render(); this.$nextTick(() => this.focus(this.active, 'end')); this.sync();
            },

            focus(i, pos) {
                this.active = Math.max(0, Math.min(i, this.blocks.length - 1));
                const ta = this.ta(this.active);
                if (!ta) return;
                ta.focus();
                if (pos === 'end') ta.selectionStart = ta.selectionEnd = ta.value.length;
                if (pos === 'start') ta.selectionStart = ta.selectionEnd = 0;
                this.$nextTick(() => ta.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
            },

            // --- Block selection -------------------------------------------

            selRange() {
                if (this.selFrom === null || this.selTo === null || this.selFrom === this.selTo) return null;
                return [Math.min(this.selFrom, this.selTo), Math.max(this.selFrom, this.selTo)];
            },

            highlightSelection() {
                const range = this.selRange();
                if (!range) { this.clearSelection(); return; }
                [...this.container.children].forEach((row, i) =>
                    row.classList.toggle('md-selected', i >= range[0] && i <= range[1]));
                document.activeElement?.blur();
            },

            clearSelection() {
                this.selFrom = this.selTo = null;
                [...(this.container?.children || [])].forEach((r) => r.classList.remove('md-selected'));
            },

            deleteSelection() {
                const range = this.selRange();
                if (!range) return;
                this.blocks.splice(range[0], range[1] - range[0] + 1, '');
                if (!this.blocks.length) this.blocks = [''];
                this.active = Math.min(range[0], this.blocks.length - 1);
                this.clearSelection(); this.render(); this.sync();
            },

            // --- Helpers ---------------------------------------------------

            ta(i) { return this.container.children[i]?.querySelector('textarea'); },
            sync() {
                this.source.value = this.blocks.join('\n');
                this.source.dispatchEvent(new Event('input', { bubbles: true }));
            },
            value() { return this.blocks.join('\n'); },
        };
    }

    // Vanilla usage without Alpine: MarkdownEditor.mount(el, options)
    function mount(el, options) {
        const c = component(options);
        c.$el = el;
        c.$nextTick = (fn) => Promise.resolve().then(fn);
        c.init();
        return c;
    }

    // Register with Alpine if it shows up (works with the CSP build too)
    document.addEventListener('alpine:init', () => {
        if (global.Alpine && global.Alpine.data) global.Alpine.data('markdownEditor', component);
    });

    global.markdownEditor = component;
    global.MarkdownEditor = { component, mount, parse, labels: LABELS, version: '1.0.0' };
})(window);
