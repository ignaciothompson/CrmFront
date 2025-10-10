import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Unidades } from './unidades';

const routes: Routes = [{ path: '', component: Unidades }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnidadesRoutingModule { }
