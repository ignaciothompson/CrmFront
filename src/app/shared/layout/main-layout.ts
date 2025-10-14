import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  pageTitle = 'Dashboard';
  userName = 'Nombre Usuario';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const deepest = this.getDeepestChild(this.route);
      this.pageTitle = deepest.snapshot.data['title'] || this.pageTitle;
    });
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }
}
