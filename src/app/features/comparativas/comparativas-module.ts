import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComparativasRoutingModule } from './comparativas-routing-module';
import { Comparativas } from './comparativas';
import { ComparativaBuilder } from './pages/comparativa-builder/comparativa-builder';
import { ComparativaView } from './pages/comparativa-view/comparativa-view';


@NgModule({
  declarations: [
    Comparativas,
    ComparativaBuilder,
    ComparativaView
  ],
  imports: [
    CommonModule,
    ComparativasRoutingModule
  ]
})
export class ComparativasModule { }
