# Notes for Claude

- Code style: Prettier (`.prettierrc.json`). Never chain `.filter(…).map(…)`: use one `.reduce(…)` that pushes what it keeps (see README, "How the code is organized").
- Plain scripts, no build step; `js/app/*.js` share one scope and load in the order listed in `index.html`.
- Bump `VERSION` in `sw.js` when files change. Tests: `node test/rules.test.js`.
- Never put an API key in this repository.
