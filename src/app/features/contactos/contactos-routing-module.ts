import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Contactos } from './contactos';
import { ContactoForm } from './contacto-form/contacto-form';

const routes: Routes = [
  { path: '', component: Contactos },
  { path: 'form', component: ContactoForm },
  { path: 'form/:id', component: ContactoForm }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactosRoutingModule { }
