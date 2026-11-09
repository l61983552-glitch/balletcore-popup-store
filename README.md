# SHUSHU/TONG × Shining Nikki SS27 — 360° Pop-up Store V3

**No paid API key or token required.** A Three.js interactive prototype designed for static GitHub Pages hosting.

## Site contents

- `index.html` — webpage interface.
- `styles.css` — responsive visual treatment.
- `main.js` — real-time 3D space, camera, exhibited artworks, image import, and interaction.
- `assets/` — original artwork, room-reference cutouts and props.

## Art and design fidelity

- The **central white ballerina installation** uses the two reference PNGs supplied by the designer. Switching to the side reference depends on camera angle. This is a **2.5D approximation**, NOT a 360° volumetric reconstruction.
- The **right-side Photo Booth** and **separate pink Baroque curtain** are taken from the provided original assets, with depth between the layers.
- Both **left and right clothing / standee areas** use a sequence of *12 low-resolution transparent cutouts* extracted from the designer's earlier side-view room renderings; these are not the separate high-res images uploaded in the latest chat messages, which were unavailable as local files for this build. The silhouettes have imperfect matte edges. Replace their images in `assets/` with the original transparent high-res artwork **keeping the same filenames** to improve visual quality instantly.
- The room uses recreated architectural geometry (columns, plaster ornament, floor), not an exact mesh from Homestyler.

## Publishing on GitHub Pages

1. Create a public repository at https://github.com/new (e.g. `ss27-balletcore-360`).
2. Upload **all files and the `assets/` directory**, not the ZIP itself, to the repository root.
3. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Visit `https://YOUR_USERNAME.github.io/ss27-balletcore-360/` once deployment has completed.

For local preview, open a terminal inside the folder and run `python -m http.server 8000`, then open `http://localhost:8000/`. Three.js imports are loaded from jsDelivr and need internet access.

## Controls

- 360° VIEW: drag and zoom.
- WALK INSIDE: click and use WASD / arrows, drag to look, Shift to walk faster.
- Shortcuts: BALLERINA / LEFT WING / RIGHT WING / PHOTO BOOTH.
- SAVE VIEW: browser screenshot (may require browser permission).
- ADD 3D MODEL: import GLB / FBX to replace the central photo-based 2.5D sculpture temporarily in the browser; uploads are not stored on GitHub automatically.

## Notes

Photo cutouts are billboards and are not 3D bodies. To spin around any character or sculptural object accurately, provide an actual `.glb`, `.gltf`, or `.fbx` 3D mesh. A front and side illustration alone cannot recover its complete back view.
