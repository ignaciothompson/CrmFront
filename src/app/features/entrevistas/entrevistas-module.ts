import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EntrevistasRoutingModule } from './entrevistas-routing-module';
import { Entrevistas } from './entrevistas';


@NgModule({
  declarations: [
    Entrevistas
  ],
  imports: [
    CommonModule,
    EntrevistasRoutingModule
  ]
})
export class EntrevistasModule { }


