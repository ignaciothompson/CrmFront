import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';

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
    SharedModule,
    UnidadesRoutingModule
  ]
})
export class UnidadesModule { }
