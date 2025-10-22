import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [RouterOutlet],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('crm-dashboard-fe');
}
