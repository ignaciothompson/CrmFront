import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Contactos } from './contactos';

const routes: Routes = [{ path: '', component: Contactos }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactosRoutingModule { }
