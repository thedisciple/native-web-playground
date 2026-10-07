# Native-web playground

Small, readable examples of things a browser can do with **plain HTML, CSS and JavaScript**. No framework, package manager or build step is needed to run the examples.

| Example | What to look at |
| --- | --- |
| [Three-axis CSS cube](cube/index.html) | Nested rotations with different periods, perspective, face lighting and reduced-motion support |
| [Microcosm](microcosm/index.html) | A tiny canvas game: movement, mass, collisions and responsive pointer controls |
| [Portfolio shell](template/index.html) | A neutral dark landing-page layout with a slim header and project cards |

Open any `index.html` directly in a browser. For a local server, run `python -m http.server` from the repository root.

The CSS cube is intentionally self-contained. The game is in its own folder so you can lift it into a teaching project, rewrite it in Python, or break it for educational purposes. There are no accounts, trackers, remote fonts or API requests.

These are **reference implementations**, not the source of any particular person's live website. Names, contact details and profile links are deliberately absent.

MIT licensed. See [LICENSE](LICENSE).

