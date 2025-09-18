# Property hider for [Obsidian.md](https://obsidian.md)
Hides *individual* metadata properties in
- notes (live preview and reading view),
- and file properties view (core plugin "Properties View")

Features:
- simple configuration in plugin settings with a quick on/off switch
- keyboard shortcuts to quickly toggle visibility of each property

<br><br>

## Example
Here's an example of my daily note
<div align="center">
    <img src="assets/preview_before.png" width="256" />
    <img src="assets/preview_after.png" width="256" />
</div>

### The one on the _right_ is much more readable, isn't it?
That's what this plugin is for: removing the unnecessary noise without limiting accessibility, allowing you to focus only on the properties that truly matter.

<br><br>

P.S. Don't worry, all your properties are still there and unchanged, just hidden from view.  
<img src="assets/preview_source.png" width="256" />


## Roadmap
- [ ] option to toggle visibility of all configured properties at once
- [ ] option to toggle visibility of the entire properties section at once
- [ ] per-note properties visibility configuration (might be tricky)

<br><br>

## Manually building the plugin
- `npm i`
- `npm run build` -> creates `main.js` from `main.ts`
- or `npm run dev` -> automatically recreates `main.js` every time you save `main.ts`
