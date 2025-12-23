import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
	form: FormGroup;
	private supabase = inject(SupabaseService);
	private router = inject(Router);
	private fb = inject(FormBuilder);

	constructor() {
		this.form = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
		});
	}

	async login() {
		if (this.form.invalid) return;
		const { email, password } = this.form.value;
		const { error } = await this.supabase.auth.signInWithPassword({ email, password });
		if (error) {
			console.error('Login error:', error);
			alert('Error al iniciar sesión: ' + error.message);
			return;
		}
		this.router.navigateByUrl('/dashboard');
	}
}
