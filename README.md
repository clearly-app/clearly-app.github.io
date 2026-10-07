# Clearly – Royal Photo Studio

A free photo editor that runs entirely in the browser: filters, color adjustments, crop, text and effects, wrapped in a liquid-glass interface with a royal gold and purple look. No sign-up, no server, no build step.

## Features

- **Filters:** 10 looks with live thumbnails (Vivid, Mono, Noir, Warm, Cool, Fade, Drama, Vintage, Cinema).
- **Adjust:** brightness, contrast, saturation, warmth, hue and blur with live preview, baked in with Apply.
- **Effects:** Auto fix, Sharpen, Vignette, Film grain.
- **Crop and resize:** 1:1, 4:3, 3:4, 16:9, 9:16 center crop, and exact width resize.
- **Transform:** rotate left or right, flip horizontal or vertical.
- **Text:** add a caption with size, color and position.
- **History:** Undo (Ctrl+Z, last 12 steps) and hold-to-compare with the original.
- **Export:** PNG, JPG or WEBP.
- **Gallery:** save your best edits and keep them in the browser.
- **Customize:** dark, light or automatic mode, ready palettes, six color pickers, glass blur, corner roundness, button shape, heading font, and effect switches. Settings can be copied and restored.

## Pages

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Landing page with a before/after demo |
| Studio | `studio.html` | The editor |
| Gallery | `gallery.html` | Your saved works and a showcase |
| Features | `features.html` | Every feature in detail |
| Customize | `customize.html` | Personalize colors, glass, fonts and effects |
| About | `about.html` | How it works and FAQ |

## Project structure

```
photo-enhancer/
├── index.html, studio.html, gallery.html,
│   features.html, customize.html, about.html
├── style.css          base design and layout
├── theme.css          light mode, theme variables, liquid glass, effect switches
├── site.js            shared navigation, footer, theme engine, liquid glass filter
├── script.js          image loading and canvas basics
└── studio-tools.js    all Studio tools
```

## Run it

1. Install VS Code and the **Live Server** extension.
2. Open the `photo-enhancer` folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.

You can also double-click `index.html`. Everything works without a server.

## How it works

- **Editing** happens on an HTML canvas. Live previews use the CSS `filter` property, and **Apply** bakes the result into the image at full resolution.
- **Undo** keeps the last 12 versions of the image in memory.
- **Theme** values are CSS variables (`--gold`, `--gold2`, `--royal`, `--royal2`, `--bg`, `--text`, `--blur`, `--radius`, `--btnr`, `--hfont`). The Customize page writes your choices to the browser and `site.js` applies them on every page.
- **Liquid glass** uses an SVG displacement filter used as a `backdrop-filter`, which refracts the background at the glass edges.

## Customize the code

- **Colors:** change the variables at the top of `style.css`, or use the Customize page.
- **Add a page:** create the HTML file, add `["page.html","Name"]` to the `pages` list at the top of `site.js`, and end the page with `<script src="site.js"></script>`.
- **Add a filter:** add a line to the `PRE` list in `studio-tools.js` with six numbers: brightness, contrast, saturation, warmth, hue, blur.
- **Glass refraction strength:** change `scale="48"` in `site.js`. Lower is subtler.

## Saved data

Stored in the browser's `localStorage`, per address (for example `127.0.0.1:5500` and `localhost:3000` are separate):

- `clearly.theme`: your Customize settings.
- `clearly.works`: up to 12 gallery thumbnails.

## Browser support

- Chrome, Edge and Brave: full experience including real liquid-glass refraction.
- Firefox and Safari: everything works, with the standard blurred glass instead of refraction.

## Known limits

- Very large photos (tens of megapixels) make Apply, Rotate and effects slower.
- Gallery thumbnails are small JPEGs, not full-size originals.
- The Showcase section in the Gallery uses illustrated examples, not real results.

## Credits

Built with plain HTML, CSS and JavaScript. Fonts: Inter and Playfair Display (Google Fonts).