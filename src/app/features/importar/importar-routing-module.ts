import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Importar } from './importar';

const routes: Routes = [
  { path: '', component: Importar }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportarRoutingModule { }


