import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { App } from './app/app';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AppRoutingModule } from './app/app-routing-module';
import { inject } from '@vercel/analytics';
// Remove Bootstrap JS import to avoid CommonJS warning; CSS is already included via angular.json

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(AppRoutingModule),
    provideCharts(withDefaultRegisterables())
  ]
})
  .then(() => {
    // Initialize Vercel Analytics after app bootstrap
    inject();
  })
  .catch(err => console.error(err));
