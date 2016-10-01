import { NgModule }       from '@angular/core';

import { ProfileComponent }    from './profile.component';


import { profileRouting } from './profile.routing';

@NgModule({
  imports: [
    profileRouting
  ],
  declarations: [
    ProfileComponent,
  ],
  providers: [
  ]
})
export class ProfileModule {}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/