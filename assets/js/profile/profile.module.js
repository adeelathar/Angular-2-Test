System.register(['@angular/core', './profile.component', './profile.routing'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, profile_component_1, profile_routing_1;
    var ProfileModule;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (profile_component_1_1) {
                profile_component_1 = profile_component_1_1;
            },
            function (profile_routing_1_1) {
                profile_routing_1 = profile_routing_1_1;
            }],
        execute: function() {
            ProfileModule = (function () {
                function ProfileModule() {
                }
                ProfileModule = __decorate([
                    core_1.NgModule({
                        imports: [
                            profile_routing_1.profileRouting
                        ],
                        declarations: [
                            profile_component_1.ProfileComponent,
                        ],
                        providers: []
                    }), 
                    __metadata('design:paramtypes', [])
                ], ProfileModule);
                return ProfileModule;
            }());
            exports_1("ProfileModule", ProfileModule);
        }
    }
});
/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/ 
//# sourceMappingURL=profile.module.js.map