import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
	@Input() title: string = '';
	@Input() userName: string = '';

	constructor(private router: Router) {}

	goToUserSettings() {
		this.router.navigateByUrl('/usuario');
	}

  goHome() {
    this.router.navigateByUrl('/dashboard');
  }
}
