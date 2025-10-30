# Error Handling and Logging

Guidelines for surfacing errors to users and recording operational context.

## Principles

- Fail fast, show concise actionable messages to users
- Avoid leaking technical details in UI; keep them in console/dev logs
- Log data changes for auditability (see Event Monitor)

## UI error patterns

- Form actions: disable submit during in-flight, show inline validation and a toast/banner on failures
- Data loads: show skeleton/placeholder, provide retry CTA on failure
- Navigation failures: redirect to a safe route (e.g., dashboard or login)

## Service layer

- Wrap Firestore calls in services under `core/services/*`
- Normalize errors to user-friendly messages before bubbling to components
- Prefer `async/await` in write paths, and Observables for reads

## Event logging (audit)

Important entity changes are recorded using `EventMonitorService`:

- `new(categoria, current)` for creates
- `edit(categoria, previous, current)` for updates (includes a diff)
- `delete(categoria, previous)` for deletes

Events are stored in the `eventos` collection with sanitized payloads (no `undefined` fields). See `docs/MonitorEventos.md` for full details.

## Console logging

- Use `console.error` for unexpected failures in development
- Avoid noisy logs in production builds; rely on user-friendly UI messages

## Common error taxonomy

- Validation errors (client-side): highlight fields and explain constraints
- Permission/auth errors: redirect to `/login` if session is missing/expired
- Network/Firestore errors: show retry option and preserve user input
