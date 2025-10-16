import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFound } from './shared/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/login/login';
import { MainLayout } from './shared/layout/main-layout';

const routes: Routes = [
	{ path: 'login', component: Login },
	{
		path: '',
		component: MainLayout,
		canActivate: [authGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
			{ path: 'dashboard', data: { title: 'Dashboard' }, loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule) },
			{ path: 'contactos', data: { title: 'Contactos' }, loadChildren: () => import('./features/contactos/contactos-module').then(m => m.ContactosModule) },
			{ path: 'unidades', data: { title: 'Listado de Proyectos' }, loadChildren: () => import('./features/unidades/unidades-module').then(m => m.UnidadesModule) },
			{ path: 'comparativas', data: { title: 'Comparativas' }, loadChildren: () => import('./features/comparativas/comparativas-module').then(m => m.ComparativasModule) },
			{ path: 'reportes', data: { title: 'Reportes' }, loadChildren: () => import('./features/reportes/reportes-module').then(m => m.ReportesModule) },
			{ path: 'listas-negras', data: { title: 'Listas negras' }, loadChildren: () => import('./features/listas-negras/listas-negras-module').then(m => m.ListasNegrasModule) },
			{ path: 'entrevistas', data: { title: 'Entrevistas' }, loadChildren: () => import('./features/entrevistas/entrevistas-module').then(m => m.EntrevistasModule) },
			{ path: 'usuario', data: { title: 'Usuario' }, loadChildren: () => import('./features/usuario/usuario-module').then(m => m.UsuarioModule) },
			{ path: 'importar', data: { title: 'Importar' }, loadChildren: () => import('./features/importar/importar-module').then(m => m.ImportarModule) },
		]
	},
	{ path: '**', component: NotFound },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
