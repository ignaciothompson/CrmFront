import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Entrevistas } from './entrevistas';

const routes: Routes = [{ path: '', component: Entrevistas }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntrevistasRoutingModule { }


