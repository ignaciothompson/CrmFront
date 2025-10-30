# Firestore Rules

Security rules control who can read and write your Firestore data.

## Current configuration

The repo contains a permissive development rule set in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // WARNING: open access
    }
  }
}
```

This allows anyone to read and write any document. Do not deploy this to production.

## Recommendations

- Lock down reads/writes to authenticated users where necessary
- Restrict public routes (`/proyecto/:id`, `/comparacion/:id`) to read-only on specific documents
- Validate document shapes and required fields per collection
- Use custom claims/roles for admin-only operations if applicable

## Emulator workflow

- Iterate on rules locally with `npm run emulators`
- Test rule behavior using the Emulator UI and integration tests

## Deployment

- Ensure production deployment includes tightened rules
- Keep `firestore.rules` in sync with service access patterns documented in `docs/data/api.md`
