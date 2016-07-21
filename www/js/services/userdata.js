angular.module('cockpit.services')

//.factory('UserData', function ($localstorage, $state, $ionicPopup, $cordovaGoogleAnalytics, $cordovaLocalNotification) {
.factory('UserData', function ($q, $http, $localstorage, URI_AUTHORIZATION_SERVER, URI_SERVER, CLIENT_ID) {
  var HAS_LOGGED_IN = 'hasLoggedIn';
  var ACCESS_TOKEN = 'accessToken';
  var VALIDATION_TOKEN = 'validationToken';
  var STORAGE_KEY = 'storage';

  return {
    login: function(type, username, password, text, token) {
      if (type === 'no2f') {
        return $q(function (resolve) {
          $http({
            method: 'POST',
            url: URI_AUTHORIZATION_SERVER + 'oauth2/token',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            data: $.param({
              username: username,
              password: password,
              grant_type: 'password',
              type: 'no2f',
              client_id: CLIENT_ID
            })
          }).then(function() {
            resolve({code: 'ERR'});
          }).catch(function (error) {
            if (error.status !== 400) {
              resolve({code: 'ERR'});
            } else {
              if (error.data.error === 'ok') {
                resolve({code: 'OK', token: error.data.error_description});
              } else if (error.data.error === 'already_sent') {
                resolve({code: 'REP'});
              } else if (error.data.error === 'invalid') {
                resolve({code: 'INV'});
              } else {
                resolve({code: 'ERR'});
              }
            }
          });
        });
      } else if (type === '2f') {
        return $q(function (resolve) {
          $http({
            method: 'POST',
            url: URI_AUTHORIZATION_SERVER + 'oauth2/token',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            data: $.param({
              username: username,
              password: password,
              grant_type: 'password',
              type: '2f',
              client_id: CLIENT_ID,
              validationText: text,
              validationToken: token
            })
          }).then(function(data) {
            $localstorage.set(HAS_LOGGED_IN, 'true');
            $localstorage.set(VALIDATION_TOKEN, token);
            $localstorage.set(ACCESS_TOKEN, data.data.access_token);
            resolve({code: 'OK'});
          }).catch(function (error) {
            if (error.status !== 400) {
              resolve({code: 'ERR'});
            } else {
              if (error.data.error === 'invalid_code') {
                resolve({code: 'INC'});
              } else if (error.data.error === 'old_code') {
                resolve({code: 'OLC'});
              } else if (error.data.error === 'invalid') {
                resolve({code: 'INV'});
              } else {
                resolve({code: 'ERR'});
              }
            }
          });
        });
      }
    },

    logout: function() {
      $localstorage.set(STORAGE_KEY, undefined);
      $localstorage.set(HAS_LOGGED_IN, undefined);
      $localstorage.set(VALIDATION_TOKEN, undefined);
      $localstorage.set(ACCESS_TOKEN, undefined);
    },

    hasLoggedIn: function() {
      return $localstorage.get(HAS_LOGGED_IN, undefined) === 'true';
    },

    get: function(url, reauthorize) {
      if (reauthorize === undefined) {
        reauthorize = true;
      }

      return $q(function (resolve) {
        if (!this.hasLoggedIn()) {
          this.logout();
          resolve({code: 'LO'});
        }

        var accessToken = $localstorage.get(ACCESS_TOKEN, '');

        $http({
          'method': 'GET',
          'url': URI_SERVER + url,
          'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + accessToken
          }
        }).then(function (data) {
            resolve({code: 'OK', data: data});
        }).catch(function (error) {
          if (error.status === 401 && reauthorize) {
            this.reauthorize().then(function () {
              this.get(url, false).then(function (result) {
                resolve(result);
              }).catch(function (error) {
                resolve({code: 'ERR'});
              });
            });
          } else {
            resolve({code: 'ERR'});
          }
        });
      });
    },

    reauthorize: function() {
      return $q(function (resolve) {
        resolve({});
      });
    }
  };
});
