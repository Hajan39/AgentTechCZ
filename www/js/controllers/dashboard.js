angular.module('cockpit.controllers')

.controller('DashCtrl', function($scope, Provident, $ionicPopup, $ionicPopover, $ionicHistory, $state, $ionicLoading, $localstorage, UserData, CockpitData, $timeout) {
  // Logout

  var performRefresh = function (data) {
    $scope.user = data.user.position;
    $scope.subs = data.user.subs;
    $scope.chosenView = {
      id: null,
      roleDescription: data.user.position.firstName + ' ' + data.user.position.lastName
    };
    $scope.plans = data.stats.plans;
    $scope.month = data.stats.month;
    $scope.comm = data.comm;

    $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.doLogout = function() {
    $ionicPopup.confirm({
      title: 'Odhlášení',
      template: 'Skutečně se chcete odhlásit z aplikace OZ Cockpit (3.2.3000039)?'
    }).then(function (res) {
      if (res) {
        UserData.logout();
      }
    });
  };

  $timeout(function() {
    CockpitData.softRefresh().then(performRefresh);
  }, 2*1000);

  $scope.doRefresh = function() {
    CockpitData.refresh().then(performRefresh);
  };

  $scope.doSoftRefresh = function() {
    CockpitData.softRefresh().then(performRefresh).catch(function () {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');

  // Person detail

  $scope.user = {
    uniqueId: null
  };
  $scope.subs = [];
  $scope.chosenView = {
    id: null,
    roleDescription: ''
  };

  CockpitData.getUser().then(function (data) {
    if (data !== null) {
      $scope.user = data.position;
      $scope.subs = data.subs;
      $scope.chosenView = {
        id: null,
        roleDescription: data.position.firstName + ' ' + data.position.lastName
      };
    }
    $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
  });

  $ionicPopover.fromTemplateUrl('templates/dashboard/filter.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.showSubFilter = function(e) {
    $scope.popover.show(e);
  };

  $scope.resetSubFilter = function() {
    $scope.chosenView = {
      id: null,
      roleDescription: ''
    };
    $scope.plans = [];
    $scope.month = null;
    $scope.comm = {weekId: 0};
    $scope.commDetail = false;

    CockpitData.getStats().then(function (data) {
      $scope.plans = data.plans;
      $scope.month = data.month;
      $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
    });
  };

  $scope.subFilterChoose = function(sub, e) {
    if (sub == null) {
      $scope.chosenView = {
        id: null,
        roleDescription: ''
      };
      $scope.plans = [];
      $scope.month = null;
      $scope.comm = {weekId: 0};
      $scope.commDetail = false;

      CockpitData.getStats().then(function (data) {
        $scope.plans = data.plans;
        $scope.month = data.month;
        $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
      });
    } else {
      $scope.chosenView = sub;
      $scope.plans = [];
      $scope.month = null;
      $scope.comm = {weekId: 0};
      $scope.commDetail = false;

      CockpitData.getSubStats(sub.id).then(function (data) {
        $scope.plans = data.plans;
        $scope.month = data.month;
        $scope.comm = data.comm;
        $scope.commDetail = false;
        $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
      });
    }

    e.preventDefault();
    $scope.popover.hide();
  };

  // Stats

  $scope.plans = [];
  $scope.month = null;

  CockpitData.getStats().then(function (data) {
    $scope.plans = data.plans;
    $scope.month = data.month;
    $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
  });

  // Commission

  $scope.comm = {
    weekId: 0
  };
  $scope.commDetail = {
    show: false
  };

  CockpitData.getAgentCommission().then(function (data) {
    $scope.comm = data;
    $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
  });

  $scope.showCommDetail = function() {
    if ($scope.comm.weekId <= 0) return;
    $ionicLoading.show({
      template: '<div><div><ion-spinner icon="ripple" class="spinner-energized" style="width: 128px; height: 128px"></div><div>Načítání provizí</div></div>'
    });
    CockpitData.getAgentCommissionDetail($scope.comm.weekId, $scope.chosenView.id).then(function (data) {
      $ionicLoading.hide();
      if (data == null) {
        $scope.commDetail = {
          show: false
        };
      }

      $scope.commDetail = {
        show: true,
        showPreviousWeek: true,
        showNextWeek: false,
        weekId: $scope.comm.weekId,
        totalAmount: data.totalAmount,
        comm: data.comm
      };
    });
  };

  $scope.doPreviousWeek = function() {
    $scope.commDetail.showPreviousWeek = false;
    $scope.commDetail.showNextWeek = false;
    var newWeek = $scope.commDetail.weekId - 1;

    CockpitData.getAgentCommissionDetail(newWeek, $scope.chosenView.id).then(function (data) {
      if (data == null) {
        $scope.commDetail = {
          show: false
        };
      }

      $scope.commDetail = {
        show: true,
        showPreviousWeek: newWeek >= ($scope.comm.weekId - 10),
        showNextWeek: newWeek < $scope.comm.weekId,
        weekId: newWeek,
        totalAmount: data.totalAmount,
        comm: data.comm
      };
      //$scope.$apply();
    });
  };

  $scope.doNextWeek = function() {
    $scope.commDetail.showPreviousWeek = false;
    $scope.commDetail.showNextWeek = false;
    var newWeek = $scope.commDetail.weekId + 1;

    CockpitData.getAgentCommissionDetail(newWeek, $scope.chosenView.id).then(function (data) {
      if (data == null) {
        $scope.commDetail = {
          show: false
        };
      }

      $scope.commDetail = {
        show: true,
        showPreviousWeek: newWeek >= ($scope.comm.weekId - 10),
        showNextWeek: newWeek < $scope.comm.weekId,
        weekId: newWeek,
        totalAmount: data.totalAmount,
        comm: data.comm
      };
      //$scope.$apply();
    });
  };
})

;
