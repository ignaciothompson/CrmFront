# Design Tokens

Design primitives defined in CSS variables. Use these tokens in components and utilities.

## Colors

- Semantic
  - `--primary-color`: #1E3A8A
  - `--success-color`: #059669
  - `--danger-color`: #E00A23
  - `--warning-color`: #FB9435
  - `--link-color`: #2680EB
- Text
  - `--text-color`: #585858
  - `--text-highlight-color`: #212121
  - `--text-light-color`: #707070
- Surfaces and borders
  - `--bg-color`: #EEEEEE
  - `--bg-lightcolor`: #F8F8F8
  - `--border-color-grey`: #B1B1B1
- Accents and tints
  - `--darkblue-color`: #0556B7
  - `--lightblue-color`: #E5F1FF
  - `--darkred-color`: #DB001A
  - `--lightred-color`: #FFF1F3
  - `--lightgreen-color`: #ECFBEA
  - `--lightorange-color`: #FCF4EB
- Derived accents
  - `--primary-hover-color`: darker primary for hover
  - `--primary-soft-bg`: soft primary background
  - `--primary-soft-border`: subtle primary border
  - `--primary-contrast`: text/icon on solid primary
  - `--success-hover-color`: darker success for hover
  - `--success-soft-bg`: soft success background
  - `--success-soft-border`: subtle success border
  - `--success-contrast`: text/icon on solid success

## Spacing

- `--padding-sm`: 5px
- `--padding-md`: 10px
- `--padding-lg`: 15px
- `--padding-input`: 12px

## Typography

- Font sizes (responsive clamps)
  - `--label-font`: 11–14px
  - `--small-font`: 11–14px
  - `--medium-font`: 13–16px
  - `--heading1-font`: 30–33px
  - `--heading2-font`: 24–27px
  - `--heading3-font`: 16–19px
  - `--heading4-font`: 14–17px
  - `--heading5-font`: 12–15px
  - `--heading6-font`: 10–13px
- Font weights
  - `--light-fweight`: 100
  - `--medium-fweight`: 400
  - `--bold-fweight`: 600

## Sizes

- Heights
  - `--desktop-height`: 32–35px (controls/buttons)
  - `--mobile-height`: 40–43px
- Widths
  - `--btn-small-minwidth`: 50–53px
  - `--btn-minwidth`: 120–123px
- Misc
  - `--label-takenup-space`: 20–23px (space when aligning controls with labels)

## Opacity

- `--mid-opacity`: 0.5

## Usage examples

- HTML
```html
<button class="btn c-btn btn-primary">Guardar</button>
<label class="c-label">Nombre</label>
<input class="form-control c-input" />
```

- Component CSS
```css
.my-card {
  background: var(--primary-soft-bg);
  border: 1px solid var(--primary-soft-border);
}
.my-link {
  color: var(--link-color);
}
```

Always prefer tokens over hard-coded values to keep styles consistent.
