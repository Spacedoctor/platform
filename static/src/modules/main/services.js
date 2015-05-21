'use strict';

angular.module("platform.services", [])

   .factory('AuthenticationService', function ($state, $cookies, $http) {
      return {     
         login: function (user) {
            var req = {
               method: 'POST',
               url: '/api/main/login/',
               data: {
                  "username": user.username,
                  "password": user.password,
               }
            };
            return $http(req).then(function (response) {
               return response.data;
            });
         },
         logout: function (user) {
            var req = {
               method: 'POST',
               url: '/api/main/logout/',
               data: {
                  uid: user
               }
            };
            return $http(req);
         },
         getUser: function (username) {
            var req = {
               method: 'POST',
               url: '/api/main/get-user/',
               data: {
                  "kerberos": username,
               }
            };
            return $http(req).then(function (response) {
               return response.data;
            });
         },
      }
   });
