import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, MobileMenu],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
	@Input() title: string = '';
	@Input() userName: string = '';

    isDark = false;
    mobileMenuOpen = false;

	private supabase = inject(SupabaseService);
	private router = inject(Router);

	constructor(
		public breakpointService: BreakpointService
	) {}

	// Getters for cleaner template syntax
	get isMobile(): boolean {
		return this.breakpointService.isMobile();
	}

	get isDesktop(): boolean {
		return this.breakpointService.isDesktop();
	}

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

	goToAdminUsers() {
		this.router.navigateByUrl('/administrar-usuarios');
	}

	async logout() {
		try {
			await this.supabase.auth.signOut();
			this.router.navigateByUrl('/login');
		} catch {}
	}

  goHome() {
    this.router.navigateByUrl('/dashboard');
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
