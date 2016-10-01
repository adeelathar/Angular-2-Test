System.register(['@angular/router', './home.component'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var router_1, home_component_1;
    var homeRoutes, homeRouting;
    return {
        setters:[
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (home_component_1_1) {
                home_component_1 = home_component_1_1;
            }],
        execute: function() {
            homeRoutes = [
                //  {
                //    path: '',
                //    redirectTo: '/home',
                //    pathMatch: 'full'
                //  },
                {
                    path: '',
                    component: home_component_1.homeComponent,
                }
            ];
            exports_1("homeRouting", homeRouting = router_1.RouterModule.forChild(homeRoutes));
        }
    }
});
/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/ 
//# sourceMappingURL=home.routing.js.map