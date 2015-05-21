'use strict';
var angular = require('angular');

require('./controllers');
require('./directives');
require('./services');
require('./routes');
require('angular-cookies');

angular.module('platform', [
      'platform.services',
      'platform.controllers',
      'platform.directives',
      'platform.routes',
      'ngCookies',
])
   .config(function(cfpLoadingBarProvider, $httpProvider) {
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
      cfpLoadingBarProvider.includeSpinner = false;
      cfpLoadingBarProvider.latencyThreshold = 0.001;
   });
   
