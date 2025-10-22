import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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
