import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
	selector: 'app-login',
	standalone: false,
	templateUrl: './login.html',
	styleUrl: './login.css'
})
export class Login {
	form: FormGroup;

	constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
		this.form = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
		});
	}

	async login() {
		if (this.form.invalid) return;
		const { email, password } = this.form.value;
		await signInWithEmailAndPassword(this.auth, email, password);
		this.router.navigateByUrl('/dashboard');
	}
}
