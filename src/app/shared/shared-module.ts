import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

import { TypeaheadComponent } from './components/typeahead/typeahead';

@NgModule({
  declarations: [TypeaheadComponent],
  imports: [CommonModule, FormsModule, NgbTypeaheadModule],
  exports: [TypeaheadComponent]
})
export class SharedModule {}


