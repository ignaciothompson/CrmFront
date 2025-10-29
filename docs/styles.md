## Styles

### Global styles
- Global CSS lives under `src/app/css` and `src/styles.css`.
- Variables and primitives are in `css/components/variables.css` and `css/components/global.css`.

### Component styles
- Each component has a co-located `.css` file referenced in the component decorator.
- Prefer utility classes already defined in `css/components/*` (e.g., `c-input`, `c-btn`, `c-table`).

### Guidelines
- Keep layout in layout components (`MainLayout`, `Header`, `Sidebar`).
- Avoid deep selectors; scope styles to the component template.
- Reuse existing table/button/form styles when possible.


