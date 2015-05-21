'use strict';
require('angular-cookies');
angular.module("platform.controllers", ['ngCookies'])
   .controller('LoginCtrl', function($cookies, $cookieStore, $scope, $rootScope, $state, $http, AuthenticationService) {
   })
   .controller('AuthenticationCtrl', function(user, $cookies, $cookieStore, $scope, $rootScope, $state, $http, AuthenticationService) {
      $rootScope.isLogin = false;
      $scope.user = user;
      $rootScope.user = user;
      $scope.setCsrf = function() {
         var req = {
            method: 'GET',
            url: '/api/main/set-csrf/',
         }
         return $http(req);
      };

      $scope.login = function(user) {
         $scope.setCsrf().then(function() {
            AuthenticationService.login(user).then(function(response) {
               if(response.auth == true) {
                  $rootScope.isLogin = true;
                  var user_uid = response['kerberos_data']['uid'][0]
                  $state.transitionTo('dashboard', {uid: user_uid}, {reload: true});
               } else {
                  $scope.error = true;
                  $scope.loginForm.$setPristine();
               }
            });

         });
      };


      $scope.logout = function(user) {
         AuthenticationService.logout($rootScope.user.uid).success(function(response) {
            $rootScope.isLogin = false;
            $cookieStore.remove('login');
            $state.go('home');
         });
      };
   });

