import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';

import { ComparativaDetailPage } from './pages/comparativa-detail/comparativa-detail';

const routes: Routes = [
  // When this module is lazy-loaded at path 'comparativas/:id', there is no
  // remaining segment, so we use '' to render the detail directly.
  { path: '', component: ComparativaDetailPage }
];

@NgModule({
  declarations: [ComparativaDetailPage],
  imports: [CommonModule, GoogleMapsModule, RouterModule.forChild(routes)],
})
export class ComparativasPublicModule {}


