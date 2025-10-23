import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Auth } from '@angular/fire/auth';
import { signOut } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
	@Input() title: string = '';
	@Input() userName: string = '';

	constructor(private router: Router, private auth: Auth) {}

	goToUserSettings() {
		this.router.navigateByUrl('/usuario');
	}

	async logout() {
		try {
			await signOut(this.auth);
			this.router.navigateByUrl('/login');
		} catch {}
	}

  goHome() {
    this.router.navigateByUrl('/dashboard');
  }
}
