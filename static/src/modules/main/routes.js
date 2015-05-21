'use strict';
angular.module('platform.routes', [
      require('ui-router'),
      require('ocLazyLoad'),
      require('angular-loading-bar'),
])
   .run(function($cookies, $rootScope, $window, $state) {

      //$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
         //if($cookies.login) {
            //$rootScope.isLogin = true;
         //} 

         //if(!$rootScope.isLogin) {
            //if(toState.name !== 'home') {
               //$state.go('home');
               //event.preventDefault();
               //return;
            //} else {
               //return;
            //}

         //} else {
            //if(toState.name === 'home') {
               //$state.go('dashboard');
               //event.preventDefault();
               //return;
            //}
            //return;
         //}

      //});

      //$rootScope.state = $state;
   })
   .config(function($ocLazyLoadProvider, $stateProvider, $urlRouterProvider) {
      $ocLazyLoadProvider.config({
         modules: []
      });

      $ocLazyLoadProvider.config({
         modules: [
            {
               name: 'dashboard-css',
               cache: true,
               files: [
                  'css/dashboard.css',
               ]
            }
         ]
      });

      $stateProvider
         //.state('home', {
            //views: {
               //'': {
                  //templateUrl: 'components/core/login.html',
                  //controller: 'AuthenticationCtrl'
               //},
            //},
            //resolve: {
               //user: function() {
               //},
            //},
            //url: '/',
         //})
         .state('dashboard', {
            views: {
               '': {
                  templateUrl: 'components/core/dashboard.html',
               },
               'content@dashboard': {
                  templateUrl: 'components/core/welcome.html',
               },
               'top-nav@dashboard': {
                  templateUrl: 'components/core/top-nav.html',
                  controller: 'AuthenticationCtrl'
               },
               'top-nav-title@dashboard': {
                  templateUrl: 'components/core/top-nav-title.html'
               },
            },
            resolve: {
               user: function($cookies, $stateParams, $rootScope, AuthenticationService) {
                  if($cookies.login) {
                     return AuthenticationService.getUser($cookies.login).then(function(response) {
                        $rootScope.user = response;
                        return response;
                     });
                  } else {
                     if($stateParams.uid != null) {
                        return AuthenticationService.getUser($stateParams.uid).then(function(response) {
                           $rootScope.user = response;
                           return response;
                        });
                     }
                  }
               },
               deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load('dashboard-css');
               }],
            },
            params: {
               uid: null,
            },
            url: '/',
         })

      $urlRouterProvider.otherwise('dashboard');
   })
