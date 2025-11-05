import { Component, Input, OnInit } from '@angular/core';
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
export class Header implements OnInit {
	@Input() title: string = '';
	@Input() userName: string = '';

    isDark = false;

	constructor(private router: Router, private auth: Auth) {}

  ngOnInit() {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = saved ? saved === 'dark' : prefersDark;
      this.applyTheme(useDark);
    } catch {
      this.applyTheme(false);
    }
  }

  toggleTheme() {
    this.applyTheme(!this.isDark);
  }

  private applyTheme(dark: boolean) {
    this.isDark = dark;
    document.body.classList.toggle('theme-dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }

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
