# Auth

Login screen and route for user authentication.

- Route: `/login` (public)
- Component: `src/app/features/auth/login/login.ts` (standalone)
- Auth: Firebase Auth (`signInWithEmailAndPassword`)

## UI

Reactive form with two controls:
- `email`: required, email format
- `password`: required, min length 6

Template snippet:
```html
<form [formGroup]="form" (ngSubmit)="login()" class="p-4" style="max-width:360px;margin:auto;">
  <h5 class="mb-3">Iniciar sesión</h5>
  <input class="form-control mb-2" placeholder="Email" formControlName="email" type="email" />
  <input class="form-control mb-3" placeholder="Password" formControlName="password" type="password" />
  <button class="btn btn-primary w-100" type="submit">Entrar</button>
</form>
```

## Behavior

- On submit, if form is valid, calls `signInWithEmailAndPassword(auth, email, password)`
- On success, navigates to `/dashboard`
- Errors: surface a message to the user (can be improved with a toast/banner)

## Notes

- This route is excluded from the `authGuard`
- After login, the guarded shell (`MainLayout`) becomes accessible
