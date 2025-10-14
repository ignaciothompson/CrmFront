import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListasNegras } from './listas-negras';

const routes: Routes = [{ path: '', component: ListasNegras }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListasNegrasRoutingModule { }


