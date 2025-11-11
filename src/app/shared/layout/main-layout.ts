import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Auth, onAuthStateChanged, Unsubscribe } from '@angular/fire/auth';
import { UsuarioService } from '../../core/services/usuario';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit, OnDestroy {
  pageTitle = 'Dashboard';
  userName = 'Nombre Usuario';
  private authUnsubscribe?: Unsubscribe;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private auth: Auth,
    private usuarioService: UsuarioService
  ) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const deepest = this.getDeepestChild(this.route);
      this.pageTitle = deepest.snapshot.data['title'] || this.pageTitle;
    });
  }

  ngOnInit(): void {
    this.authUnsubscribe = onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const profile = await firstValueFrom(this.usuarioService.getUsuarioById(user.uid));
          if (profile) {
            this.userName = `${profile.nombre || ''} ${profile.apellido || ''}`.trim() || user.email || 'Usuario';
          } else {
            this.userName = user.email || 'Usuario';
          }
        } catch {
          this.userName = user.email || 'Usuario';
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }
}
