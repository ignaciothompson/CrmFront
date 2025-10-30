# Performance

Targets and strategies to keep the app fast.

## Budgets

- Initial bundle: warn at 1.5MB, error at 2MB
- Any component stylesheet: warn at 10kB, error at 20kB

## Loading strategy

- Lazy-load components by route using `loadComponent`
- Keep `MainLayout` minimal to reduce shell cost

## Assets and CSS

- Rely on shared CSS from Bootstrap and `main.css` to avoid duplication
- Remove unused CSS where possible; prefer component-scoped styles

## Observables and change detection

- Use `async` pipe to auto-unsubscribe
- Avoid redundant subscriptions; compute derived data in services

## Firebase usage

- Query only required fields
- Avoid unnecessary reads after writes; prefer optimistic UI where safe

## Measurement

- Use Chrome DevTools and Angular profiler
- Track Core Web Vitals on production deploys
