/*! @xinix00/markdown v1.1.1 | MIT | https://github.com/xinix00/markdown */
(function (global) {
    'use strict';

    // -----------------------------------------------------------------------
    // Block parsing — every line is a block, the prefix decides the style
    // -----------------------------------------------------------------------

    const RE = /^(#{1,3} |[-*] |\d+\. |> |```)/;
    const TYPES = {
        '# ': ['h1', '#'], '## ': ['h2', '##'], '### ': ['h3', '###'],
        '- ': ['bullet', '•'], '* ': ['bullet', '•'], '> ': ['quote', null], '```': ['code', '</>'],
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
        placeholder: 'Type here…',
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

                // Mouse drag across blocks selects a range. Browsers capture the mouse for the
                // textarea during a text-selection drag, so we track the pointer on the document.
                this._onMouseMove = (e) => {
                    if (!this.mouseDown || this.dragFrom === null) return;
                    const to = this.rowAt(e.clientY);
                    if (to !== this.dragFrom || this.selRange()) this.select(this.dragFrom, to);
                };
                this._onMouseUp = () => { this.mouseDown = false; this.dragFrom = null; };
                document.addEventListener('mousemove', this._onMouseMove);
                document.addEventListener('mouseup', this._onMouseUp);

                this._onFocusOut = (e) => {
                    if (!root.contains(e.relatedTarget)) this.clearSelection();
                };
                root.addEventListener('focusout', this._onFocusOut);

                // Keyboard while a block range is selected (focus is on the root element)
                this._onKeyDown = (e) => {
                    const range = this.selRange();
                    if (!range || e.target !== root) return; // textarea keys are handled in buildBlock()
                    const mod = e.metaKey || e.ctrlKey;
                    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
                    if (key === 'Escape') { const to = this.selTo; this.clearSelection(); this.focus(to, 'end'); }
                    else if (key === 'Backspace' || key === 'Delete') { this.deleteSelection(); }
                    else if (key === 'ArrowUp' || key === 'ArrowDown') {
                        const dir = key === 'ArrowUp' ? -1 : 1;
                        if (e.shiftKey) this.select(this.selFrom, this.selTo + dir);
                        else { const to = this.selTo; this.clearSelection(); this.focus(to, dir < 0 ? 'start' : 'end'); }
                    }
                    else if (mod && key === 'c') { this.copySelection(); }
                    else if (mod && key === 'x') { this.copySelection(); this.deleteSelection(); }
                    else if (mod && key === 'a') { this.selectAll(); }
                    else if (mod) { return; } // let other shortcuts (paste, undo…) through
                    else if (key === 'Enter') { this.deleteSelection(); }
                    else if (e.key.length === 1 && !e.altKey) { this.replaceSelection(e.key); }
                    else return;
                    e.preventDefault();
                };
                root.addEventListener('keydown', this._onKeyDown);

                // Clipboard events (Edit menu / context menu) while a block range is selected
                this._onCopy = (e) => {
                    const range = this.selRange();
                    if (!range) return;
                    e.preventDefault();
                    e.clipboardData.setData('text/plain', this.selectedText());
                    if (e.type === 'cut') this.deleteSelection();
                };
                root.addEventListener('copy', this._onCopy);
                root.addEventListener('cut', this._onCopy);
                this._onPaste = (e) => {
                    const range = this.selRange();
                    if (!range) return;
                    e.preventDefault();
                    this.replaceSelection(e.clipboardData.getData('text'));
                };
                root.addEventListener('paste', this._onPaste);
            },

            destroy() {
                document.removeEventListener('mousemove', this._onMouseMove);
                document.removeEventListener('mouseup', this._onMouseUp);
                const root = this.$el;
                if (!root) return;
                root.removeEventListener('focusout', this._onFocusOut);
                root.removeEventListener('keydown', this._onKeyDown);
                root.removeEventListener('copy', this._onCopy);
                root.removeEventListener('cut', this._onCopy);
                root.removeEventListener('paste', this._onPaste);
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

                // Start of a possible drag-selection (see _onMouseMove)
                row.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return;
                    this.clearSelection();
                    this.mouseDown = true;
                    this.dragFrom = i;
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
                    const mod = e.metaKey || e.ctrlKey;
                    const last = this.blocks.length - 1;
                    const atStart = !ta.selectionStart && !ta.selectionEnd;
                    const firstNl = ta.value.indexOf('\n'), lastNl = ta.value.lastIndexOf('\n');
                    const onFirstLine = firstNl === -1 || ta.selectionStart <= firstNl;
                    const onLastLine = lastNl === -1 || ta.selectionEnd > lastNl;

                    if (e.key === 'Enter') {
                        if (e.shiftKey && !isHeading) return; // Shift+Enter = soft newline (not in headings)
                        e.preventDefault(); this.split(i, ta);
                    }
                    else if (e.shiftKey && e.key === 'ArrowUp' && onFirstLine && i > 0) { e.preventDefault(); this.select(i, i - 1); }
                    else if (e.shiftKey && e.key === 'ArrowDown' && onLastLine && i < last) { e.preventDefault(); this.select(i, i + 1); }
                    else if (mod && e.key.toLowerCase() === 'a' && last > 0 && ta.selectionStart === 0 && ta.selectionEnd === ta.value.length) {
                        e.preventDefault(); this.selectAll(); // second Cmd/Ctrl+A (or on an empty block) selects all blocks
                    }
                    else if (e.key === 'Backspace' && atStart && i > 0) { e.preventDefault(); this.merge(i); }
                    else if (e.key === 'ArrowUp' && !ta.selectionStart && i > 0) { e.preventDefault(); this.focus(i - 1, 'end'); }
                    else if (e.key === 'ArrowDown' && ta.selectionStart === ta.value.length && i < last) { e.preventDefault(); this.focus(i + 1, 'start'); }
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
                const isBullet = prefix === '- ' || prefix === '* ';
                const isList = isBullet || /^\d+\. /.test(prefix);

                this.blocks[i] = prefix + before;

                if (isList && !before.trim()) { this.blocks[i] = ''; this.blocks.splice(i + 1, 0, after); }
                else if (/^\d+\. /.test(prefix)) this.blocks.splice(i + 1, 0, (parseInt(prefix, 10) + 1) + '. ' + after);
                else if (isBullet) this.blocks.splice(i + 1, 0, prefix + after);
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
                const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e);
                ta.value = ta.value.slice(0, s) + syntax + sel + syntax + ta.value.slice(e);
                this.blocks[this.active] = parse(this.blocks[this.active]).prefix + ta.value;
                // With a selection: cursor after the closing syntax. Without: cursor between the markers.
                ta.selectionStart = ta.selectionEnd = sel ? s + syntax.length * 2 + sel.length : s + syntax.length;
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
            // A range of whole blocks. While active, focus sits on the root element and
            // the keyboard/clipboard handlers in init() operate on the raw markdown lines.

            select(from, to) {
                const last = this.blocks.length - 1;
                from = Math.max(0, Math.min(from, last));
                to = Math.max(0, Math.min(to, last));
                if (from === to) { this.clearSelection(); this.focus(from, 'end'); return; }
                this.selFrom = from; this.selTo = to;
                this.$el.classList.add('md-selecting');
                this.$el.focus(); // moves focus off the textarea; relatedTarget is inside root so focusout keeps the selection
                window.getSelection?.().removeAllRanges();
                const [a, b] = this.selRange();
                [...this.container.children].forEach((row, i) => row.classList.toggle('md-selected', i >= a && i <= b));
                this.container.children[to]?.scrollIntoView({ block: 'nearest' });
            },

            selectAll() { this.select(0, this.blocks.length - 1); },

            selRange() {
                if (this.selFrom === null || this.selTo === null || this.selFrom === this.selTo) return null;
                return [Math.min(this.selFrom, this.selTo), Math.max(this.selFrom, this.selTo)];
            },

            selectedText() {
                const range = this.selRange();
                return range ? this.blocks.slice(range[0], range[1] + 1).join('\n') : '';
            },

            clearSelection() {
                this.selFrom = this.selTo = null;
                this.$el?.classList.remove('md-selecting');
                [...(this.container?.children || [])].forEach((r) => r.classList.remove('md-selected'));
            },

            rowAt(clientY) {
                const rows = [...this.container.children];
                for (let i = 0; i < rows.length; i++) {
                    if (clientY <= rows[i].getBoundingClientRect().bottom) return i;
                }
                return rows.length - 1;
            },

            copySelection() {
                const text = this.selectedText();
                const fallback = () => {
                    const ta = document.createElement('textarea');
                    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                    document.body.appendChild(ta); ta.select();
                    try { document.execCommand('copy'); } catch (_) { /* ignore */ }
                    ta.remove(); this.$el.focus();
                };
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(fallback);
                else fallback();
            },

            // Replace the selected blocks with the given text (one block per line)
            replaceSelection(text) {
                const range = this.selRange();
                if (!range) return;
                const lines = text.split('\n');
                this.blocks.splice(range[0], range[1] - range[0] + 1, ...lines);
                this.active = range[0] + lines.length - 1;
                this.clearSelection(); this.render(false); this.sync();
                this.focus(this.active, 'end');
            },

            deleteSelection() { this.replaceSelection(''); },

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
    global.MarkdownEditor = { component, mount, parse, labels: LABELS, version: '1.1.1' };
})(window);
