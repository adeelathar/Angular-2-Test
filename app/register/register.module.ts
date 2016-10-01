import { NgModule }       from '@angular/core';

import { registerComponent }     from './register.component';
import { registerRouting } from './register.routing';




@NgModule({
  imports: [
    registerRouting
  ],
  declarations: [
    registerComponent,
  ],

  providers: [
  ]
})
export class registerModule {}
