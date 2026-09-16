# markdown

A tiny block-based markdown editor. Every line is its own block; the prefix
you type decides how it looks (`# `, `- ` or `* `, `1. `, `> `, ` ``` `). The result is
plain markdown in a normal `<textarea>`, so it drops into any form.

- Two plain files (JS + CSS), no build step, no dependencies
- Works standalone or as an [Alpine.js](https://alpinejs.dev) component
- Enter splits a block, Backspace at the start merges, lists continue automatically
- Select whole blocks by dragging across them or with Shift+↑/↓ (Cmd/Ctrl+A twice selects everything)
- A block selection supports copy, cut, paste, Backspace/Delete and typing over it; copying gives the raw markdown
- Bold/italic/strike wrap the selection, or drop `****` with the cursor in the middle
- Themeable with CSS custom properties, all labels overridable

## Install

Via jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/xinix00/markdown@1.1.1/markdown.min.css">
<script src="https://cdn.jsdelivr.net/gh/xinix00/markdown@1.1.1/markdown.min.js"></script>
```

Or copy `markdown.js` and `markdown.css` into your project.

## Usage

With Alpine.js — wrap a `<textarea>` in an element with `x-data`:

```html
<div x-data="markdownEditor()">
  <textarea name="body"># Hello
Some **bold** text.</textarea>
</div>
```

Without Alpine:

```js
MarkdownEditor.mount(document.querySelector('#editor'), { placeholder: 'Write…' });
```

The original textarea is hidden and kept in sync, so a regular form submit
(or `FormData`) just works. It also fires an `input` event on every change.

## Options

```js
markdownEditor({
  toolbar: true,               // set false to hide the toolbar
  placeholder: 'Type here…',   // shown in the first empty block
  labels: {                    // toolbar titles
    bold: 'Vet', italic: 'Cursief', strike: 'Doorhalen',
    h1: 'Kop 1', h2: 'Kop 2', h3: 'Kop 3',
    bullet: 'Opsomming', numbered: 'Genummerd', quote: 'Citaat',
    code: 'Code', paragraph: 'Paragraaf',
  },
})
```

## Theming

Override any of these on `.md-editor` or an ancestor:

```css
.md-editor {
  --md-accent: #2563eb;   /* focus border, list markers, quote bar */
  --md-fg: #111827;       /* text */
  --md-muted: #6b7280;    /* toolbar icons, quotes */
  --md-faint: #9ca3af;    /* decorators, placeholder */
  --md-border: #d1d5db;
  --md-divider: rgba(0,0,0,.08);
  --md-soft: rgba(0,0,0,.04);   /* toolbar + code background */
  --md-hover: rgba(0,0,0,.08);
  --md-radius: .5rem;
  --md-font-size: .875rem;
  --md-min-height: calc(6 * 1.6 * .875rem + 1rem);  /* 6 lines */
  --md-max-height: 20rem;
}
```

Toolbar icons are inline SVGs from [Lucide](https://lucide.dev) (ISC).

## License

MIT
