import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
	const supabase = inject(SupabaseService);
	const router = inject(Router);
	
	const { data: { session } } = await supabase.auth.getSession();
	if (!session) {
		router.navigateByUrl('/login');
		return false;
	}
	return true;
};
