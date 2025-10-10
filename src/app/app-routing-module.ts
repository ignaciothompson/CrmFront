import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFound } from './shared/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/pages/login/login';
import { MainLayout } from './shared/layout/main-layout';

const routes: Routes = [
	{ path: 'login', component: Login },
	{
		path: '',
		component: MainLayout,
		canActivate: [authGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
			{ path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule) },
			{ path: 'contactos', loadChildren: () => import('./features/contactos/contactos-module').then(m => m.ContactosModule) },
			{ path: 'unidades', loadChildren: () => import('./features/unidades/unidades-module').then(m => m.UnidadesModule) },
			{ path: 'comparativas', loadChildren: () => import('./features/comparativas/comparativas-module').then(m => m.ComparativasModule) },
		]
	},
	{ path: '**', component: NotFound },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
