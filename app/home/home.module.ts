import { NgModule }       from '@angular/core';



import { homeComponent }     from './home.component';


import { homeRouting } from './home.routing';

@NgModule({
  imports: [
    homeRouting
  ],
  declarations: [
    homeComponent,
  ],

  providers: [
  ]
})
export class HomeModule {}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/