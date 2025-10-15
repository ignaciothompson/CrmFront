import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';

import { EntrevistasRoutingModule } from './entrevistas-routing-module';
import { Entrevistas } from './entrevistas';
import { EntrevistaForm } from './form/entrevista-form';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    Entrevistas,
    EntrevistaForm
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    FullCalendarModule,
    SharedModule,
    EntrevistasRoutingModule
  ]
})
export class EntrevistasModule { }


