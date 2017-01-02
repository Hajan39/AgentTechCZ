angular.module('cockpit.services')

//.factory('UserData', function ($localstorage, $state, $ionicPopup, $cordovaGoogleAnalytics, $cordovaLocalNotification) {
.factory('UserData', function ($q, $http, $localstorage, URI_AUTHORIZATION_SERVER, URI_SERVER, CLIENT_ID) {
  var HAS_LOGGED_IN = 'hasLoggedIn';
  var ACCESS_TOKEN = 'accessToken';
  var VALIDATION_TOKEN = 'validationToken';
  var STORAGE_KEY = 'storage';
  var PASSWORD = 'phoneNumber';
  var LAST_UPDATE = 'lastUpdate';

  var that = {
    getToken: function() {
      return $localstorage.get(VALIDATION_TOKEN);
    },
    login: function(type, username, password, text, token) {
      if (type === 'no2f') {
        return $q(function (resolve) {
          $http({
            method: 'POST',
            url: URI_AUTHORIZATION_SERVER + 'oauth2/token',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Cache-Control': 'private, no-store, max-age=0'
            },
            data: $.param({
              username: username,
              password: password,
              grant_type: 'password',
              type: 'no2f',
              client_id: CLIENT_ID
            })
          }).then(function() {
            resolve({code: 'ERR', message: 'Server return 200 (OK)'});
          }).catch(function (error) {
            if (error.status !== 400) {
              resolve({code: 'ERR', message: error.statusText + ' (' + error.status + ')'});
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
      } else if (type == '2f') {
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
            $localstorage.set(STORAGE_KEY, '{}');
            $localstorage.set(PASSWORD, password);

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
      } else {
        return $q(function (resolve) {
          var realPassword = $localstorage.get(PASSWORD, '');
          if (realPassword.length === 0) {
            resolve({code: 'ERR'});
            return;
          }

          $http({
            method: 'POST',
            url: URI_AUTHORIZATION_SERVER + 'oauth2/token',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            data: $.param({
              username: token,
              password: realPassword,
              grant_type: 'password',
              type: 'token',
              client_id: CLIENT_ID,
              validationToken: token
            })
          }).then(function(data) {
            $localstorage.set(ACCESS_TOKEN, data.data.access_token);

            resolve({code: 'OK'});
          }).catch(function (error) {
            resolve({code: 'ERR'});
          });
        });
      }
    },

    getLastUpdate: function() {
      return moment(new Date($localstorage.get(LAST_UPDATE)));
    },

    logout: function() {
      $localstorage.set(STORAGE_KEY, undefined);
      $localstorage.set(HAS_LOGGED_IN, undefined);
      $localstorage.set(VALIDATION_TOKEN, undefined);
      $localstorage.set(ACCESS_TOKEN, undefined);
      $localstorage.set(LAST_UPDATE, undefined);
      window.location.reload();
    },

    hasLoggedIn: function() {
      return $localstorage.get(HAS_LOGGED_IN, undefined) === 'true';
    },

    refresh: function() {
      $localstorage.set(STORAGE_KEY, '{}');
    },

    get: function(url, storageKey, reauthorize) {
      if (reauthorize === undefined) {
        reauthorize = true;
      }

      return $q(function (resolve) {
        if (!that.hasLoggedIn()) {
          $localstorage.set(STORAGE_KEY, undefined);
          $localstorage.set(HAS_LOGGED_IN, undefined);
          $localstorage.set(VALIDATION_TOKEN, undefined);
          $localstorage.set(ACCESS_TOKEN, undefined);
          $localstorage.set(LAST_UPDATE, undefined);
          window.location.reload();
        }

        var storage = $localstorage.getObject(STORAGE_KEY);

        if (storageKey !== undefined && storage[storageKey] !== undefined) {
          resolve({code: 'OK', data: storage[storageKey].value});
          return;
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
            if (storageKey !== undefined) {
              storage[storageKey] = {value: data.data};
              $localstorage.setObject(STORAGE_KEY, storage);
              $localstorage.set(LAST_UPDATE, new Date());
            }

            resolve({code: 'OK', data: data.data});
        }).catch(function (error) {
          if (error.status === 401 && reauthorize) {
            that.reauthorize().then(function (reIn) {
              if (reIn.code == 'ERR') {
                $localstorage.set(STORAGE_KEY, undefined);
                $localstorage.set(HAS_LOGGED_IN, undefined);
                $localstorage.set(VALIDATION_TOKEN, undefined);
                $localstorage.set(ACCESS_TOKEN, undefined);
                $localstorage.set(LAST_UPDATE, undefined);
                window.location.reload();
                return;
              }
              that.get(url, storageKey, false).then(function (result) {
                if (storageKey !== undefined) {
                  storage[storageKey] = {value: data.data};
                  $localstorage.setObject(STORAGE_KEY, storage);
                  $localstorage.set(LAST_UPDATE, new Date());
                }

                resolve(result);
              }).catch(function (error) {
                resolve({code: 'ERR'});
              });
            }).catch(function (error) {
              $localstorage.set(STORAGE_KEY, undefined);
              $localstorage.set(HAS_LOGGED_IN, undefined);
              $localstorage.set(VALIDATION_TOKEN, undefined);
              $localstorage.set(ACCESS_TOKEN, undefined);
              $localstorage.set(LAST_UPDATE, undefined);
              window.location.reload();
            });
          } else {
            resolve({code: 'ERR'});
          }
        });
      });
    },

    post: function(url, data, reauthorize) {
      if (reauthorize === undefined) {
        reauthorize = true;
      }

      return $q(function (resolve) {
        if (!that.hasLoggedIn()) {
          this.logout();
          window.location.reload();
        }

        var accessToken = $localstorage.get(ACCESS_TOKEN, '');

        $http({
          'method': 'POST',
          'url': URI_SERVER + url,
          'data': data,
          'headers': {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + accessToken
          }
        }).then(function (data) {
            resolve({code: 'OK', data: data.data});
        }).catch(function (error) {
          if (error.status === 401 && reauthorize) {
            that.reauthorize().then(function () {
              that.get(url, false).then(function (result) {
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
      var token = $localstorage.get(VALIDATION_TOKEN, '');

      return that.login('token', token, '', '', token);
    }
  };

  return that;
});
