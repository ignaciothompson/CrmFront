import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListasNegrasRoutingModule } from './listas-negras-routing-module';
import { ListasNegras } from './listas-negras';


@NgModule({
  declarations: [
    ListasNegras
  ],
  imports: [
    CommonModule,
    ListasNegrasRoutingModule
  ]
})
export class ListasNegrasModule { }


