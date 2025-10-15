import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ContactosRoutingModule } from './contactos-routing-module';
import { Contactos } from './contactos';
import { ContactoForm } from './contacto-form/contacto-form';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    Contactos,
    ContactoForm
  ],
  imports: [
    CommonModule,
    FormsModule,
    ContactosRoutingModule,
    SharedModule
  ]
})
export class ContactosModule { }
