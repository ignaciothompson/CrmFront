import { NgModule, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { Header } from './shared/layout/header/header';
import { Sidebar } from './shared/layout/sidebar/sidebar';
import { MainLayout } from './shared/layout/main-layout';
import { NotFound } from './shared/not-found/not-found';
import { Login } from './features/auth/pages/login/login';

@NgModule({
  declarations: [
    App,
    Header,
    Sidebar,
    MainLayout,
    NotFound,
    Login
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
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
  ],
  bootstrap: [App]
})
export class AppModule { }
