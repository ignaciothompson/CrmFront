import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnidadesRoutingModule } from './unidades-routing-module';
import { Unidades } from './unidades';
import { UnidadList } from './pages/unidad-list/unidad-list';
import { UnidadForm } from './components/unidad-form/unidad-form';


@NgModule({
  declarations: [
    Unidades,
    UnidadList,
    UnidadForm
  ],
  imports: [
    CommonModule,
    UnidadesRoutingModule
  ]
})
export class UnidadesModule { }
