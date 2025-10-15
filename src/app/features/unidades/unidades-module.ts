import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UnidadesRoutingModule } from './unidades-routing-module';
import { Unidades } from './unidades';
import { UnidadForm } from './unidad-form/unidad-form';


@NgModule({
  declarations: [
    Unidades,
    UnidadForm
  ],
  imports: [
    CommonModule,
    FormsModule,
    UnidadesRoutingModule
  ]
})
export class UnidadesModule { }
