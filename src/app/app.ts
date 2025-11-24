import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointService } from './core/services/breakpoint.service';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('crm-dashboard-fe');

  constructor(private breakpointService: BreakpointService) {}

  ngOnInit(): void {
    // Initialize breakpoint service early to ensure body classes are set
    // The service is already initialized via constructor injection
  }
}
