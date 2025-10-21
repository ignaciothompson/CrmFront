import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { GoogleMapsModule } from '@angular/google-maps';

import { ComparativasRoutingModule } from './comparativas-routing-module';
import { Comparativas } from './comparativas';
import { SharedModule } from '../../shared/shared-module';
import { CompareModal } from './components/compare-modal/compare-modal';


@NgModule({
  declarations: [
    Comparativas,
    CompareModal,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    GoogleMapsModule,
    SharedModule,
    ComparativasRoutingModule
  ]
})
export class ComparativasModule { }
