# Style Guide

Conventions for writing and using styles in this project.

## Principles

- Use design tokens (CSS variables) instead of hard-coded values
- Prefer existing utilities and component classes in `src/app/css/components/*`
- Keep component styles local and shallow; avoid deep selectors
- Wrap app content in `.c-skin` to scope the theme

## Naming

- Component classes: `c-<name>` (e.g., `c-btn`, `c-input`, `c-label`, `frame`)
- Utilities live in `global.css` (e.g., `text-muted`, `m-t-sm`, `d-flex`)
- Buttons always include Bootstrap base + custom: `btn c-btn <variant>`
- Inputs always include Bootstrap base + custom: `form-control c-input`

## Layout and frames

- Use the frame pattern as a standard container:
```html
<div class="c-skin frame">
  <div class="frame-title">
    <h4>Título</h4>
    <div class="frame-actions">…</div>
  </div>
  <div class="frame-body">…</div>
  <div class="frame-footer">…</div>
</div>
```

## Forms

- Labels: `label.c-label`
- Inputs: `input.form-control.c-input` (also for `select` and `textarea`)
- Ranges: wrap in `.input-group.input-range` with `.range-item`

## Buttons

- Base: `btn c-btn`
- Variants:
  - `btn-primary`: primary action
  - `btn-white`: secondary action
  - `btn-default`: cancel / go back
  - `btn-square`: small icon actions (export, print, search, refresh)
- Input-attached: if a square button is attached to an input use white styling
```html
<div class="input-group">
  <input class="form-control c-input" placeholder="Buscar" />
  <button class="btn c-btn btn-white btn-square" aria-label="Buscar">
    <i class="fa fa-search"></i>
  </button>
</div>
```

## Utilities

- Spacing: `m-*/p-*` (e.g., `m-t-sm`, `m-b-md`, `p-hz-sm`)
- Flex: `d-flex`, `justify-content-*`, `align-items-*`, `wrap/no-wrap`, `gap-*`
- Text: `text-muted`, `text-success`, `text-warning`, `text-danger`, `text-info`

## Responsive

- Controls adapt heights with `--mobile-height` within `.mobile` or media queries
- Keep interactive targets at least the control height for touch usability

## Do / Don’t

- Do: reuse tokens and utilities, keep selectors simple, scope to component
- Don’t: override Bootstrap defaults globally; layer with `c-*` classes instead
