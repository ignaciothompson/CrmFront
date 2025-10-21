import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComparativasListPage } from './pages/comparativas-list/comparativas-list';

const routes: Routes = [
  { path: '', component: ComparativasListPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComparativasListRoutingModule { }


