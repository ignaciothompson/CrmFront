import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
	const auth = inject(Auth);
	const router = inject(Router);
	const isAuthed = await new Promise<boolean>((resolve) => {
		onAuthStateChanged(auth, (user) => resolve(!!user));
	});
	if (!isAuthed) {
		router.navigateByUrl('/login');
		return false;
	}
	return true;
};
