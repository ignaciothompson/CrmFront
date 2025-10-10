import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactosRoutingModule } from './contactos-routing-module';
import { Contactos } from './contactos';
import { ContactoList } from './pages/contacto-list/contacto-list';
import { ContactoForm } from './components/contacto-form/contacto-form';


@NgModule({
  declarations: [
    Contactos,
    ContactoList,
    ContactoForm
  ],
  imports: [
    CommonModule,
    ContactosRoutingModule
  ]
})
export class ContactosModule { }
