import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImportarRoutingModule } from './importar-routing-module';
import { Importar } from './importar';


@NgModule({
  declarations: [
    Importar,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ImportarRoutingModule
  ]
})
export class ImportarModule { }


