const scarlettModule = angular.module('scarlettModule', [require('angular-route')]);

scarlettModule.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

scarlettModule.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    template: '<assistant></assistant>'
  })
  .otherwise({
    redirectTo: '/'
  });
});
