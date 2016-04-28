// Ionic Starter App

// Load AES

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
if (window.analytics === undefined) {
  window.analytics = {trackView: function(view) { console.log('track', view); }, startTrackerWithId: function(id){}};
}

//device = {uuid: 'abcvd'};

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $state, $localstorage, Provident, $cordovaGoogleAnalytics) {
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

    //Provident.getUuid();

    // Google Analytics
    $cordovaGoogleAnalytics.startTrackerWithId('UA-61689828-1');
    window.analytics.enableUncaughtExceptionReporting(true);

    /*$ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);*/

    var switchToLogin = function(endState, e) {
      if (endState == 'login') {
        return true;
      }

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
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('tab.ag', {
    url: '/ag',
    views: {
      'tab-ag': {
        templateUrl: 'templates/tab-ag.html',
        controller: 'AgCtrl'
      }
    }
  })
    .state('tab.product1', {
      url: '/product1/:discount/:type/:term/:issue',
      views: {
        'tab-ag': {
          templateUrl: 'templates/product-step1.html',
          controller: 'Product1Ctrl'
        }
      }
    })
    .state('tab.product2', {
      url: '/product2/:discount/:type/:term/:issue',
      views: {
        'tab-ag': {
          templateUrl: 'templates/product-step2.html',
          controller: 'Product1Ctrl'
        }
      }
    })
    .state('tab.table', {
      url: '/table/:discount/:type/:term/',
      views: {
        'tab-ag': {
          templateUrl: 'templates/product-table.html',
          controller: 'ProductTableCtrl'
        }
      }
    })

  .state('tab.ptp', {
      url: '/ptp',
      views: {
        'tab-ptp': {
          templateUrl: 'templates/tab-ptp.html',
          controller: 'PtpCtrl'
        }
      }
    })

  .state('tab.sc-nc', {
      url: '/sc-nc',
      views: {
        'tab-sc-nc': {
          templateUrl: 'templates/tab-sc-nc.html',
          controller: 'ScNcCtrl'
        }
      }
    })

  .state('tab.sc-res', {
      url: '/sc-res',
      views: {
        'tab-sc-res': {
          templateUrl: 'templates/tab-sc-res.html',
          controller: 'ScResCtrl'
        }
      }
    })

  .state('tab.friends', {
      url: '/friends',
      views: {
        'tab-friends': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/dash');

});
