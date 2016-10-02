import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent }         from './app.component';
import { routing,
         appRoutingProviders }  from './app.routing';

import { registerModule }         from './register/register.module';
import { ProfileModule }         from './profile/profile.module';
import { HomeModule }   from './home/home.module';


@NgModule({
  imports: [
    BrowserModule,
    routing,
    ProfileModule,
    registerModule,
    HomeModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    appRoutingProviders,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/