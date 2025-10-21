import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { ComparativasListRoutingModule } from './comparativas-list-routing-module';
import { ComparativasListPage } from './pages/comparativas-list/comparativas-list';

@NgModule({
  declarations: [ComparativasListPage],
  imports: [CommonModule, FormsModule, SharedModule, ComparativasListRoutingModule]
})
export class ComparativasListModule {}


