import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared-module';

import { ListasNegrasRoutingModule } from './listas-negras-routing-module';
import { ListasNegras } from './listas-negras';
import { BlacklistModal } from './blacklist-modal/blacklist-modal';


@NgModule({
  declarations: [
    ListasNegras,
    BlacklistModal
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    SharedModule,
    ListasNegrasRoutingModule
  ]
})
export class ListasNegrasModule { }


