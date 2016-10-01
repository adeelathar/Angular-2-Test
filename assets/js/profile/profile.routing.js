System.register(['@angular/router', './profile.component'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var router_1, profile_component_1;
    var profileRoutes, profileRouting;
    return {
        setters:[
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (profile_component_1_1) {
                profile_component_1 = profile_component_1_1;
            }],
        execute: function() {
            profileRoutes = [
                { path: 'profile', component: profile_component_1.ProfileComponent },
            ];
            exports_1("profileRouting", profileRouting = router_1.RouterModule.forChild(profileRoutes));
        }
    }
});
/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/ 
//# sourceMappingURL=profile.routing.js.map