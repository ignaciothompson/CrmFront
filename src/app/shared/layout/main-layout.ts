import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import { UsuarioService } from '../../core/services/usuario';
import { BreakpointService } from '../../core/services/breakpoint.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit, OnDestroy {
  pageTitle = 'Dashboard';
  userName = 'Nombre Usuario';
  private supabase = inject(SupabaseService);
  private authSubscription?: { data: { subscription: any } };

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    public breakpointService: BreakpointService
) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        const deepest = this.getDeepestChild(this.route);
      this.pageTitle = deepest.snapshot.data['title'] || this.pageTitle;
    });
}

  // Getters for cleaner template syntax
  get isMobile(): boolean {
    return this.breakpointService.isMobile();
  }

  get isDesktop(): boolean {
    return this.breakpointService.isDesktop();
  }

  ngOnInit(): void {
    // Load initial user
    this.loadUser();

    // Subscribe to auth state changes
    const { data } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.updateUserName(session.user);
      }
    });
    this.authSubscription = { data };
  }

  async loadUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (user) {
      await this.updateUserName(user);
    }
  }

  async updateUserName(user: any) {
    try {
      const profile = await firstValueFrom(this.usuarioService.getUsuarioById(user.id));
      if (profile) {
        this.userName = `${profile.nombre || ''} ${profile.apellido || ''}`.trim() || user.email || 'Usuario';
      } else {
        this.userName = user.email || 'Usuario';
      }
    } catch {
      this.userName = user.email || 'Usuario';
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription?.data?.subscription) {
      this.authSubscription.data.subscription.unsubscribe();
    }
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }
}
