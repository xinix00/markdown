# markdown

A tiny block-based markdown editor. Every line is its own block, and the
prefix you type decides how it looks. The result is plain markdown in a normal
`<textarea>`, so it drops into any form.

- Two plain files (JS + CSS), no build step, no dependencies
- Works standalone or as an [Alpine.js](https://alpinejs.dev) component
- Every block is a real `<textarea>`: focus is browser focus, nothing is
  computed or overlaid, no `contenteditable`
- Themeable with CSS custom properties, all labels overridable

## Install

Via jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/xinix00/markdown@1.8.0/markdown.min.css">
<script src="https://cdn.jsdelivr.net/gh/xinix00/markdown@1.8.0/markdown.min.js"></script>
```

Or copy `markdown.js` and `markdown.css` into your project.

## Usage

With Alpine.js, wrap a `<textarea>` in an element with `x-data`:

```html
<div x-data="markdownEditor()">
  <textarea name="body"># Hello
Some **bold** text.</textarea>
</div>
```

Without Alpine:

```js
const editor = MarkdownEditor.mount(document.querySelector('#editor'), { placeholder: 'Write…' });
editor.value(); // current markdown
```

The original textarea is hidden and kept in sync, so a regular form submit
(or `FormData`) just works. It also fires an `input` event on every change.

## Blocks

| You type | Block |
|---|---|
| `# `, `## `, `### ` | Heading 1–3 |
| `- ` or `* ` | Bullet list (Enter continues the list, Enter on an empty item ends it, Shift+Enter breaks the line inside the item) |
| `1. ` | Numbered list (Enter numbers the next item) |
| `>` | Quote, shown as a comment-style callout (no space needed; Enter continues the quote, Enter on an empty line ends it) |
| ` ``` ` | Code fence. Everything up to the closing ` ``` ` is code: no prefixes, Enter is a plain new line, Tab indents. The toolbar button wraps the current line in fences, or unwraps the fence you are in |
| `\|` | Table row, see [Tables](#tables) |
| `![alt](src)` | Image, see [Images](#images) |

Enter starts a new line (a new block). In a list or a quote the marker is
carried to the next line, and Enter on an empty item ends the list or quote.
Shift+Enter inserts a line break *inside* a list item (stored as an indented
continuation line, `- a\n  b`) or a table cell; anywhere else it would produce
the same markdown as Enter, so it simply is Enter. Backspace at the start of a
block merges it into the previous one. Pasting multi-line text creates one
block per line. The toolbar sets or changes a block's prefix.

## Keyboard

| Keys | Action |
|---|---|
| Cmd/Ctrl+B, Cmd/Ctrl+I, Cmd/Ctrl+Shift+S (or X) | Bold, italic, strikethrough: wraps the selection, or inserts `****` with the caret in between. Press again to remove the markers |
| ↑ / ↓ at the first / last line | Move to the previous / next block |
| Shift+↑ / Shift+↓ | Select whole blocks (starts at the block edge) |
| Cmd/Ctrl+A | Selects the block's text; a second press (or a press in an empty block) selects all blocks. Works in table cells too |
| Backspace / Delete on a block selection | Delete the blocks |
| Cmd/Ctrl+C / X / V on a block selection | Copy or cut the **raw markdown** of the blocks, paste over them (one block per line) |
| Typing on a block selection | Replaces the blocks |
| Esc | Leave the block selection |

You can also select blocks by dragging across them with the mouse, in either
direction. Copying through the Edit menu or context menu gives the raw markdown
as well.

## Tables

A line starting with `|` is a table row. Consecutive rows form a table that is
shown as a grid of cells, and each cell is a textarea like every other block:
multi-line with Shift+Enter, auto-growing. Columns take their natural width,
long text wraps, the table never scrolls horizontally.

| Keys | Action |
|---|---|
| Tab / Shift+Tab | Next / previous cell (native). Tab from the very last cell with nothing below the table creates a line under it |
| ← / → at the cell edge | Previous / next cell |
| ↑ / ↓ at the first / last line of a cell | Same column in the previous / next row (the separator line is skipped) |
| Enter | New row below. On the header row the `\| --- \|` separator is inserted first |
| Enter on an empty last row | Ends the table (the row becomes an empty line) |
| `\|` inside a cell | Adds a column right there; the cell is split at the caret |
| Backspace in an empty cell | Removes the column when it is empty in every row, otherwise moves to the previous cell |
| Backspace on an empty row | Removes the row |

A table always keeps its header, its separator and one data row, so none of
the above can leave you with a broken table; deleting a block selection that
cuts into a table repairs it the same way. To remove a table, select all its
rows and press Backspace.

The raw markdown is kept aligned and rectangular automatically. A `|` typed in
a cell that should stay literal is stored as `\|`, a line break inside a cell as
`<br>` (the GFM convention). The toolbar's table button inserts a two-column
starter table.

## Images

A line that is exactly `![alt](src)` (optionally with a `"title"`) is an image
block: the line stays an editable textarea and the real image is shown
underneath at `max-width: 100%`. Editing the line updates the image in place.
While an image does not load (half-typed URL, 404) it stays hidden.

Sources can be translated, for example from a file id to a URL:

```js
markdownEditor({
  images: { 'logo': '/files/3f9a…' },   // src → URL map
  imageUrl: (src) => src,               // or a function; wins over `images`
})
editor.refreshImages();                 // re-resolve after changing the map
```

## Options

```js
markdownEditor({
  toolbar: true,               // set false to hide the toolbar
  placeholder: 'Type here…',   // shown in the first empty block
  images: {},                  // see Images
  imageUrl: undefined,         // see Images
  labels: {                    // toolbar titles
    bold: 'Vet', italic: 'Cursief', strike: 'Doorhalen',
    h1: 'Kop 1', h2: 'Kop 2', h3: 'Kop 3',
    bullet: 'Opsomming', numbered: 'Genummerd', quote: 'Citaat',
    code: 'Code', table: 'Tabel', paragraph: 'Paragraaf',
  },
})
```

The component exposes `value()`, `focus(i, pos)`, `select(from, to)`,
`selectAll()`, `refreshImages()` and the `blocks` array. `MarkdownEditor` also
exports `parse(line)`, `parseImage(line)` and `formatTable(rows)`.

## Theming

Override any of these on `.md-editor` or an ancestor:

```css
.md-editor {
  --md-accent: #2563eb;   /* focus border, list markers, quote bar */
  --md-fg: #111827;       /* text */
  --md-muted: #6b7280;    /* toolbar icons, quotes */
  --md-faint: #9ca3af;    /* decorators, placeholder */
  --md-border: #d1d5db;
  --md-divider: rgba(0,0,0,.08);   /* toolbar line, table cell borders */
  --md-soft: rgba(0,0,0,.04);      /* toolbar, code, quote and table header background */
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
