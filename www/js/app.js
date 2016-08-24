// Ionic Starter App

// Load AES

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
if (window.analytics === undefined) {
  window.analytics = {trackView: function(view) { console.log('track', view); }, startTrackerWithId: function(id){}, setUserId: function(id,id) {}};
}

if (window.device === undefined) {
  window.device = {uuid: ''};
}

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callbackfn, initVal) {
        "use strict";
        var arr = this,
            arrLen = arr.length,
            k = 0,
            accumulator = initVal === undefined ? undefined : initVal;

        for(;k < arrLen;k++) {
            if (accumulator !== undefined && k in arr) {
                accumulator = callbackfn.call(undefined, accumulator, arr[k], k, arr);
            } else {
                accumulator = arr[k];
            }
        }
        return accumulator;
    };
}

//device = {uuid: 'abcvd'};

[].map||(Array.prototype.map=function(a){for(var b=this,c=b.length,d=[],e=0,f;e<b;)d[e]=e in b?a.call(arguments[1],b[e],e++,b):f;return d});

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}

angular.module('cockpit.services', ['ionic', 'ngCordova']);
angular.module('cockpit.controllers', ['ionic', 'ngCordova', 'cockpit.services']);


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'ngCordova', 'cockpit.services', 'cockpit.controllers'])


.run(function($ionicPlatform, $rootScope, $state, $localstorage, $cordovaGoogleAnalytics, $ionicHistory, UserData, JSLOGME_KEY) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $ionicPlatform.registerBackButtonAction(function(e) {
      if ($rootScope.backButtonPressedOnceToExit) {
        navigator.app.exitApp();
      } else if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else {
        $rootScope.backButtonPressedOnceToExit = true;
        window.plugins.toast.showShortBottom('Klikněte zpět znovu pro vypnutí aplikace', function(a) { }, function(b) { });
        setTimeout(function() {
          $rootScope.backButtonPressedOnceToExit = false;
        }, 2000);
      }
      e.preventDefault();
      return false;
    }, 101);

    //Provident.getUuid();

    if ($localstorage.getObject('comm') == {}) {
      $localstorage.setObject('comm', {
        weekId: 0,
        amount: 0
      });
    }

    var jslog = new JsLog({ key: JSLOGME_KEY });
    jslog.log('First message');

    // Google Analytics
    $cordovaGoogleAnalytics.startTrackerWithId('UA-61689828-1');
    if (window.analytics.enableUncaughtExceptionReporting !== undefined)
      window.analytics.enableUncaughtExceptionReporting(true);

    var getLastTuesday = function(date, keyDay, keyHour) {
      if (keyDay === undefined) keyDay = 2;
      if (keyHour === undefined) keyHour = 17;
      date.setMinutes(0);
      date.setSeconds(0);
      while (date.getHours() != keyHour) {
        date.setHours(date.getHours() - 1);
      }
      while (date.getDay() != keyDay) {
        date = new Date(date - 1000*60*60*24);
      }
      return date;
    };

    if ($localstorage.getObject('resDataUpdate') != {}) {
      var update = $localstorage.getObject('resDataUpdate').timestamp;
      var concreteData = new Date();
      var lastTuesday = getLastTuesday(concreteData);

      if (update < lastTuesday) {
        $localstorage.setObject('resData', {});
        $localstorage.setObject('resDataUpdate', {timestamp: concreteData});
      }
    }

    var switchToLogin = function(endState, e) {
      if (endState == 'login') {
        return true;
      }
/*
      if

      var user = $localstorage.getObject('user');
      console.log(user, endState);
      if (user.auth === undefined) {
        console.log('settings');
        user = {
          auth: false
        };
      }

      console.log('check auth', user, !user.auth);
      if (!user.auth) {
        if (e != undefined) e.preventDefault();
        $state.go('login', {location: 'replace'});
        console.log('teď by byl login');
        return false;
      } else {
        return true;
      }
      */

      var hasLoggedIn = UserData.hasLoggedIn();

      if (!hasLoggedIn) {
        if (e !== undefined) e.preventDefault();
        $state.go('login', {location: 'replace'});
        return false;
      } else {
        return true;
      }
    };

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      if (switchToLogin(toState.name)) {
        $cordovaGoogleAnalytics.trackView(toState.name);
      }
    });

    if (switchToLogin('tab.dash')) {
      $cordovaGoogleAnalytics.trackView('init');
      $state.go('tab.dash', {location: 'replace'});
    }
  });
})

.constant('$ionicLoadingConfig', {
   template: '<div><div><ion-spinner icon="ripple" class="spinner-energized" style="width: 128px; height: 128px"></div><div>Odesílání SMS</div></div>'
})

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dashboard/home.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('tab.product', {
    url: '/product',
    views: {
      'tab-product': {
        templateUrl: 'templates/product/home.html',
        controller: 'ProductHomeCtrl'
      }
    }
  })
  .state('tab.issue', {
    url: '/issue',
    views: {
      'tab-product': {
        templateUrl: 'templates/product/issue.html',
        controller: 'ProductIssueCtrl'
      }
    }
  })
  .state('tab.repay', {
    url: '/repay',
    views: {
      'tab-product': {
        templateUrl: 'templates/product/repay.html',
        controller: 'ProductRepayCtrl'
      }
    }
  })

    .state('tab.sli', {
      url: '/product-sli/:key/:issue',
      views: {
        'tab-product': {
          templateUrl: 'templates/product/sli.html',
          controller: 'ProductSilCtrl'
        }
      }
    })

      .state('tab.ag', {
        url: '/product-ag/:key/:issue',
        views: {
          'tab-product': {
            templateUrl: 'templates/product/contract.html',
            controller: 'ProductAgCtrl'
          }
        }
      })
    .state('tab.table', {
      url: '/table/:key',
      views: {
        'tab-product': {
          templateUrl: 'templates/product/table.html',
          controller: 'ProductTableCtrl'
        }
      }
    })

  .state('tab.sms-ptp', {
      url: '/sms-ptp',
      views: {
        'tab-sms-ptp': {
          templateUrl: 'templates/sms/ptp.html',
          controller: 'PtpCtrl'
        }
      }
    })

  .state('tab.sms-scoring', {
      url: '/sms-scoring',
      views: {
        'tab-sms-scoring': {
          templateUrl: 'templates/sms/scoring.html',
          controller: 'SmsScoringCtrl'
        }
      }
    })

  .state('tab.sms-sale', {
      url: '/sms-sale',
      views: {
        'tab-sms-sale': {
          templateUrl: 'templates/sms/sale.html',
          controller: 'SaleCtrl'
        }
      }
    })

  .state('tab.results', {
    url: '/results',
    views: {
      'tab-results': {
        templateUrl: 'templates/results/home.html',
        controller: 'ResultsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/dash');

});
