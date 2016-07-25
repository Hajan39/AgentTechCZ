angular.module('cockpit.controllers')

.controller('ResultsCtrl', function($scope, $state, $ionicLoading, $localstorage, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics, CockpitData, $ionicModal) {
  // BRM Results

  $scope.brmRole = '';
  $scope.viewData = [];
  $scope.fulfillment = [];

  CockpitData.getUser().then(function (user) {
    $scope.brmRole = user.position.role;
    $scope.user = user.position;

    if (user.position.role == 'BR') {
      CockpitData.getReports().then(function (reports) {
        $scope.viewData = reports.plans;
        $scope.fulfillment = reports.fulfillment;
      });
    }
  });

  $scope.reportBrm = function() {
    var action = function () {
      CockpitData.sendReports().then(function () {
        $ionicPopup.alert({
          title: 'Výsledky odeslány na bránu'
        });
      }).catch(function (message) {
        $ionicPopup.alert({
          title: 'Chyba',
          template: message !== undefined && message.length > 0 ? message : 'Výsledky se nepodařilo odeslat'
        })
      });
    }

    if ($scope.fulfillment.length > 0) {
      var myPopup = $ionicPopup.show({
        template: $scope.fulfillment.map(function (i) {
          return i + '<br>';
        }),
        title: 'Opravdu chcete odeslat výsledky?',
        subTitle: 'Následující OZ zatím nedoslali své výsledky.',
        scope: $scope,
        buttons: [
          {
            text: 'Zrušit'
          },
          {
            text: '<strong>Odeslat</strong>',
            type: 'button-positive',
            onTap: function (e) {
              action();
            }
          }
        ]
      });
    } else {
      var myPopup = $ionicPopup.confirm({
        title: 'Opravdu chcete odeslat výsledky?'
      }).then(function (e) {
        action();
      });
    }
  };

  $ionicModal.fromTemplateUrl('templates/results-detail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.brmModal = modal;
  });

  $scope.brmModalData = {paramName: '', reports: []};

  $scope.brmShowStats = function (paramName) {
    CockpitData.getParamReports(paramName).then(function (reports) {
      $scope.brmModalData = {
        paramName: paramName,
        reports: reports
      };
      $scope.brmModal.show();
    });
  };
  $scope.brmModalClose = function() {
    $scope.brmModal.hide();
  }

  // Agent SMS

  if ($localstorage.getObject('resData') == {}) {
    $localstorage.setObject('resData', {
      nc: 0,
      obn: 0,
      sub: 0,
      ref: 0,
      pu: 0,
      sal: 0,
      coll: 0,
      vz: 0,
      _5pc: 0,
      _5ec: 0,
      _8ec: 0,
      _12pc: 0,
      riac: 0,
      nriac: 0,
      qcc: 0,
      btqc: 0,
      _12c: 0,
      _5pv: 0,
      _5ev: 0,
      _8ev: 0,
      _12pv: 0,
      riav: 0,
      nriav: 0,
      qcv: 0,
      btqv: 0,
      _12v: 0,
      pNC: 0,
      pSA: 0,
      pCO: 0
    });
    $localstorage.setObject('resDataUpdate', {timestamp: new Date()});
  }

  $scope.sc = $localstorage.getObject('resData');

  $scope.report = function (data) {
    if (data._5pc == null || data._5pc === undefined) data._5pc = 0;
    if (data._5ec == null || data._5ec === undefined) data._5ec = 0;
    if (data._8ec == null || data._8ec === undefined) data._8ec = 0;
    if (data._12pc == null || data._12pc === undefined) data._12pc = 0;
    if (data.riac == null || data.riac === undefined) data.riac = 0;
    if (data.nriac == null || data.nriac === undefined) data.nriac = 0;
    if (data.qcc == null || data.qcc === undefined) data.qcc = 0;
    if (data.btqc == null || data.btqc === undefined) data.btqc = 0;
    if (data._12c == null || data._12c === undefined) data._12c = 0;
    if (data._5pv == null || data._5pv === undefined) data._5pv = 0;
    if (data._5ev == null || data._5ev === undefined) data._5ev = 0;
    if (data._8ev == null || data._8ev === undefined) data._8ev = 0;
    if (data._12pv == null || data._12pv === undefined) data._12pv = 0;
    if (data.riav == null || data.riav === undefined) data.riav = 0;
    if (data.nriav == null || data.nriav === undefined) data.nriav = 0;
    if (data.qcv == null || data.qcv === undefined) data.qcv = 0;
    if (data.btqv == null || data.btqv === undefined) data.btqv = 0;
    if (data._12v == null || data._12v === undefined) data._12v = 0;
    if (data.pNC == null || data.pNC === undefined) data.pNC = 0;
    if (data.pSA == null || data.pSA === undefined) data.pSA = 0;
    if (data.pCO == null || data.pCO === undefined) data.pCO = 0;

    if (data.nc == undefined) data.nc = null;
    if (data.obn == undefined) data.obn = null;
    if (data.sub == undefined) data.sub = null;
    if (data.ref == undefined) data.ref = null;
    if (data.sal == undefined) data.sal = null;
    if (data.coll == undefined) data.coll = null;
    if (data.pu == undefined) data.pu = null;
    if (data.vz == undefined) data.vz = null;

    if (data.nc === null || data.obn === null || data.sub === null || data.ref === null || data.pu === null || data.sal === null || data.coll === null || data.vz === null) {
      $ionicPopup.alert({
            title: 'SMS',
            template: 'Nebyly vyplněny povinné položky.<br><small>Prvních osm parametrů je nutno vyplnit pro odeslání výsledků.</small>'
          });
      return;
    }

    $ionicLoading.show();
    $localstorage.setObject('resData', data);
    $localstorage.setObject('resDataUpdate', {timestamp: new Date()});

    var text = "#ROZ" +
      ';' + data.sid +
      ';' + data.nc + ' NC' +
      ';' + data.obn + ' OBN' +
      ';' + data.sub + ' SOU' +
      ';' + data.ref + ' REF' +
      ';' + data.pu + ' PU' +
      ';' + data.sal + ' SAL' +
      ';' + data.coll + ' COLL' +
      ';' + data.vz + ' VZ;';

    if (data._5pc != 0 || data._5pv != 0) {
      text += data._5pc + '/' + data._5pv + ' 5+;';
    }
    if (data._5ec != 0 || data._5ev != 0) {
      text += data._5ec + '/' + data._5ev + ' 5=;';
    }
    if (data._8ec != 0 || data._8ev != 0) {
      text += data._8ec + '/' + data._8ev + ' 8=;';
    }
    if (data._12pc != 0 || data._12pv != 0) {
      text += data._12pc + '/' + data._12pv + ' 12+;';
    }
    if (data.riac != 0 || data.riav != 0) {
      text += data.riac + '/' + data.riav + ' RIA;';
    }
    if (data.nriac != 0 || data.nriav != 0) {
      text += data.nriac + '/' + data.nriav + ' NRIA;';
    }
    if (data.qcc != 0 || data.qcv != 0) {
      text += data.qcc + '/' + data.qcv + ' QC;';
    }
    if (data.btqc != 0 || data.btqv != 0) {
      text += data.btqc + '/' + data.btqv + ' BTQ;';
    }
    if (data._12c != 0 || data._12v != 0) {
      text += data._12c + '/' + data._12v + ' 12St;';
    }

    if (data.pNC != 0 || data.pSA != 0 || data.pCO != 0) {
        text += data.pNC + '/' + data.pSA + '/' + data.pCO + ' PRED;';
    }

    $cordovaSms.send('+420606999008', text)
      .then(function() {
        $ionicLoading.hide();
        $cordovaGoogleAnalytics.trackEvent('SMS', 'ROZ');
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Výsledky odeslány'
        });
        $state.go('tab.dash');
      }, function() {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'SMS se nepodařilo odeslat.<br><small>Zkontrolujte údaje, příp. kontaktuje IT helpdesk.</small>'
        });
      });
  }
});
