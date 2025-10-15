import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Entrevistas } from './entrevistas';
import { EntrevistaForm } from './form/entrevista-form';

const routes: Routes = [
  { path: '', component: Entrevistas },
  { path: 'form', component: EntrevistaForm }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntrevistasRoutingModule { }


