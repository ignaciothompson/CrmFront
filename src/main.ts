import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from './environments/environment';
import { App } from './app/app';
import { AppRoutingModule } from './app/app-routing-module';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

bootstrapApplication(App, {
  providers: [
    provideAnimations(),
    importProvidersFrom(AppRoutingModule),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (isDevMode()) connectAuthEmulator(auth, 'http://localhost:9099');
      return auth;
    }),
    provideFirestore(() => {
      const db = getFirestore();
      if (isDevMode()) connectFirestoreEmulator(db, 'localhost', 8080);
      return db;
    })
  ]
})
  .catch(err => console.error(err));
