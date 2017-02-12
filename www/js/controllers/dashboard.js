function onSuccess() { }
function onError() { }

angular.module('cockpit.controllers')

.controller('DashCtrl', function($scope, Provident, $ionicPopup, $ionicPopover, $ionicHistory, $state, $ionicLoading, $localstorage, UserData, CockpitData, $timeout, $ionicModal, $cordovaSms) {
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
    console.log(data.leads);
    if (data.leads.length !== undefined) {
      $scope.leads = data.leads;
      $scope.shownLeads = [];

      if (data.leads.length > 0) $scope.shownLeads.push(data.leads[0])
      if (data.leads.length > 1) $scope.shownLeads.push(data.leads[1])
      if (data.leads.length > 2) $scope.shownLeads.push(data.leads[2])
      if (data.leads.length > 3) $scope.shownLeads.push(data.leads[3])
      if (data.leads.length > 4) $scope.shownLeads.push(data.leads[4])

      $scope.leadShowAll = true;
    } else {
      $scope.leads = $scope.shownLeads = [];
      $scope.leadShowAll = false;
    }

    $scope.lastUpdate = UserData.getLastUpdate().format('HH:mm D. M. YYYY');
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.doLogout = function() {
    $ionicPopup.confirm({
      title: 'Odhlášení',
      template: 'Skutečně se chcete odhlásit z aplikace OZ Cockpit?'
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

  // leads
  $scope.leads = [];
  $scope.shownLeads = [];
  $scope.leadShowAll = false;
  $scope.leadModal = null;
  $scope.lead = null;
  $scope.leadCcn = window.plugins === undefined ? null : window.plugins.CallNumber;
  $scope.leadForm = '';
  $scope.leadDetailCloseStateList = []
  $scope.leadDetailTransferBrms = []
  if ($scope.leadCcn === undefined) $scope.leadCcn = null;

  CockpitData.getLeadClosedStatuses().then(function (res) {
    $scope.leadDetailCloseStateList = res;
  });
  CockpitData.getLeadSubs().then(function (res) {
    $scope.leadDetailScheduleSubList = res[0];
  })
  CockpitData.getLeadBrms().then(function (res) {
    $scope.leadDetailTransferBrms = res.filter(function (a) {
      console.log($scope.user.staffCode);
      return a !== $scope.user.staffCode;
    });
  })
  $ionicModal.fromTemplateUrl('templates/dashboard/leaddetail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    console.log('hey')
    $scope.leadModal = modal;
  });
  $scope.leadDoShowAll = function () {
    $scope.shownLeads = $scope.leads
    $scope.leadShowAll = false
  }
  $scope.leadOpenDetail = function(lead) {
    $scope.lead = lead;
    $scope.leadForm = '';
    $scope.leadClose = {status: -1, note: ''};
    $scope.leadSchedule = {
      assignedTo: lead.Activity.AssignedTo,
      date: moment(lead.Activity.ScheduledFor === null ? new Date() : lead.Activity.ScheduledFor).add(30, 'minute').toDate(),
      note: lead.Activity.ScheduledNote
    };
    $scope.leadTransfer = {brm: '', note: ''};
    $scope.leadModal.show();
  };
  $scope.leadDetailHide = function() {
    $scope.leadModal.hide();
  }
  $scope.leadDetailSms = function(lead) {
    var text = 'Dobry den, pokouseli jsem se Vas telefonicky kontaktovat ohledne Vasi zadosti o zapujcku. Prosim, kontaktuje nas na cisle ' + CockpitData.getLeadPhoneNumber() + '. Dekujeme Vas Provident';
    $cordovaSms.send(lead.Contact.MobilePhoneNumber, text, {
      android: {
        intent: 'INTENT'
      }
    });
  }
  $scope.leadDetailCall = function(lead) {
    if ($scope.leadCcn !== null) {
      $scope.leadCcn.callNumber(function () {

      }, function() {

      }, lead.Contact.MobilePhoneNumber, true);
    }
  }
  $scope.leadDetailNav = function(lead) {
    var label = encodeURI(lead.Contact.StreetName + ' ' + lead.Contact.HouseNumber + ', ' + lead.Contact.Town);
    window.open('geo:0,0?q=' + label, '_system');
  }
  $scope.leadDetailForm = function(form) {
    $scope.leadForm = form;
  }
  $scope.leadDetailClose = function(form) {
    CockpitData.leadClose($scope.lead.Process.Id, form.status, form.note !== null ? form.note : '').then(function () {
      $scope.doRefresh();
      $scope.leadModal.hide();
    }, function () {
      alert('Při uzavírání leadu došlo k chybě.');
    })
  }
  $scope.leadDetailSchedule = function(form) {
    CockpitData.leadSchedule($scope.lead.Process.Id, form.assignedTo, form.date, form.note !== null ? form.note : '').then(function() {
      $scope.doRefresh();
      $scope.leadModal.hide();
    }, function() {
      alert('Lead lze pouze naplánovat 14 dnů dopředu - zkontrolujte nastavení.');
    })
  }
  $scope.leadDetailTransfer = function(form) {
    CockpitData.leadTransfer($scope.lead.Process.Id, form.brm, form.note !== null ? form.note : '').then(function() {
      $scope.doRefresh();
      $scope.leadModal.hide();
    }, function() {
      alert('Při přesunu leadu došlo k chybě.');
    })
  }
  $scope.leadDetailScore = function(lead) {
    $scope.leadModal.hide();
    $state.go('tab.sms-scoring', {
      pin: lead.Contact.Pin,
      firstName: lead.Contact.FirstName,
      lastName: lead.Contact.LastName,
      phone: lead.Contact.MobilePhoneNumber ? lead.Contact.MobilePhoneNumber : lead.Contact.HousePhoneNumber,
      lid: lead.Process.IdNetlemProcess
    });
  }
  $scope.leadDetailPayOut = function(lead) {
    $scope.leadModal.hide();
    $state.go('tab.sms-sale', {
      pin: lead.Contact.Pin,
      lid: lead.Process.Id
    });
  }

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
