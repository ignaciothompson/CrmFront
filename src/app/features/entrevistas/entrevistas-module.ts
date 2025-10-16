import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from '@fullcalendar/angular';

import { EntrevistasRoutingModule } from './entrevistas-routing-module';
import { Entrevistas } from './entrevistas';
import { SharedModule } from '../../shared/shared-module';
import { MeetModal } from './components/meet-modal/meet-modal';
import { EntrevistaForm } from './form/entrevista-form';


@NgModule({
  declarations: [
    Entrevistas,
    EntrevistaForm,
    MeetModal
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
    NgbModalModule,
    FullCalendarModule,
    SharedModule,
    EntrevistasRoutingModule
  ]
})
export class EntrevistasModule { }


