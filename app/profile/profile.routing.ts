import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileComponent }    from './profile.component';

const profileRoutes: Routes = [
  { path: 'profile',  component: ProfileComponent },
];

export const profileRouting: ModuleWithProviders = RouterModule.forChild(profileRoutes);


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/