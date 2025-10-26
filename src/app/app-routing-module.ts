import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFound } from './shared/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/login/login';
import { MainLayout } from './shared/layout/main-layout';

const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  // Public access to shared comparativas by id (new public path)
  { path: 'comparacion/:id', loadComponent: () => import('./features/comparativas/pages/comparativa-detail/comparativa-detail').then(m => m.ComparativaDetailPage) },
	{
		path: '',
		component: MainLayout,
		canActivate: [authGuard],
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
			{ path: 'dashboard', data: { title: 'Dashboard' }, loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
			{ path: 'contactos', data: { title: 'Contactos' }, loadComponent: () => import('./features/contactos/contactos').then(m => m.Contactos) },
			{ path: 'contactos/form', data: { title: 'Contacto' }, loadComponent: () => import('./features/contactos/contacto-form/contacto-form').then(m => m.ContactoForm) },
			{ path: 'contactos/form/:id', data: { title: 'Contacto' }, loadComponent: () => import('./features/contactos/contacto-form/contacto-form').then(m => m.ContactoForm) },
			{ path: 'unidades', data: { title: 'Listado de Proyectos' }, loadComponent: () => import('./features/unidades/unidades').then(m => m.Unidades) },
			{ path: 'unidades/form', data: { title: 'Proyecto' }, loadComponent: () => import('./features/unidades/unidad-form/unidad-form').then(m => m.UnidadForm) },
			{ path: 'unidades/form/:id', data: { title: 'Proyecto' }, loadComponent: () => import('./features/unidades/unidad-form/unidad-form').then(m => m.UnidadForm) },
            { path: 'comparativas', data: { title: 'Crear Comparativas' }, loadComponent: () => import('./features/comparativas/pages/comparativas-create/comparativas').then(m => m.Comparativas) },
            { path: 'listado-comparativas', data: { title: 'Comparativas' }, loadComponent: () => import('./features/comparativas/pages/comparativas-list/comparativas-list').then(m => m.ComparativasListPage) },
			{ path: 'reportes', data: { title: 'Reportes' }, loadComponent: () => import('./features/reportes/reportes').then(m => m.Reportes) },
            { path: 'monitor-eventos', data: { title: 'Monitor de Eventos' }, loadComponent: () => import('./features/monitor-eventos/monitor-eventos').then(m => m.MonitorEventosComponent) },
			{ path: 'listas-negras', data: { title: 'Listas negras' }, loadComponent: () => import('./features/listas-negras/listas-negras').then(m => m.ListasNegras) },
			{ path: 'entrevistas', data: { title: 'Entrevistas' }, loadComponent: () => import('./features/entrevistas/entrevistas').then(m => m.Entrevistas) },
			{ path: 'entrevistas/form', data: { title: 'Entrevista' }, loadComponent: () => import('./features/entrevistas/form/entrevista-form').then(m => m.EntrevistaForm) },
			{ path: 'usuario', data: { title: 'Usuario' }, loadComponent: () => import('./features/usuario/usuario').then(m => m.Usuario) },
			{ path: 'importar', data: { title: 'Importar' }, loadComponent: () => import('./features/importar/importar').then(m => m.Importar) },
		]
	},
	{ path: '**', component: NotFound },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
