import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { ListasNegrasRoutingModule } from './listas-negras-routing-module';
import { ListasNegras } from './listas-negras';
import { BlacklistModal } from './components/blacklist-modal/blacklist-modal';


@NgModule({
  declarations: [
    ListasNegras,
    BlacklistModal
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModalModule,
    ListasNegrasRoutingModule
  ]
})
export class ListasNegrasModule { }


