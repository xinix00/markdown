# markdown

A tiny block-based markdown editor. Every line is its own block; the prefix
you type decides how it looks (`# `, `- ` or `* `, `1. `, `>`, ` ``` `, `|`). The result is
plain markdown in a normal `<textarea>`, so it drops into any form.

- Two plain files (JS + CSS), no build step, no dependencies
- Works standalone or as an [Alpine.js](https://alpinejs.dev) component
- Enter splits a block, Backspace at the start merges, lists continue automatically
- Cmd/Ctrl+B, I and Shift+S wrap the selection (or toggle the markers off again)
- Tables: a line starting with `|` is a table row, shown as a grid of cells that behave like every other block: multi-line (Shift+Enter), auto-growing. Tab moves to the next cell (natively; from the last cell with nothing below it creates a line under the table), arrows move between cells and rows, Enter adds a row (and the `---` separator after the header), Enter on an empty last row ends the table (a table always keeps its header and one data row; select the rows and press Backspace to remove it). Type `|` in a cell to add a column right there; Backspace in an empty cell removes the column when it is empty everywhere. The raw markdown stays aligned automatically; line breaks inside a cell are stored as `<br>`.
- Select whole blocks by dragging across them or with Shift+↑/↓ (Cmd/Ctrl+A twice selects everything)
- A block selection supports copy, cut, paste, Backspace/Delete and typing over it; copying gives the raw markdown
- Bold/italic/strike wrap the selection, or drop `****` with the cursor in the middle
- Themeable with CSS custom properties, all labels overridable

## Install

Via jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/xinix00/markdown@1.5.2/markdown.min.css">
<script src="https://cdn.jsdelivr.net/gh/xinix00/markdown@1.5.2/markdown.min.js"></script>
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
    code: 'Code', table: 'Tabel', paragraph: 'Paragraaf',
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
