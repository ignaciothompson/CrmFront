import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Unidades } from './unidades';
import { UnidadForm } from './unidad-form/unidad-form';

const routes: Routes = [
  { path: '', component: Unidades },
  { path: 'form', component: UnidadForm },
  { path: 'form/:id', component: UnidadForm }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnidadesRoutingModule { }
