import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Comparativas } from './comparativas';

const routes: Routes = [{ path: '', component: Comparativas }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComparativasRoutingModule { }
