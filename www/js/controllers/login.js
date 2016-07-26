angular.module('cockpit.controllers')

.controller('LoginCtrl', function($scope, $state, UserData, $ionicLoading, $ionicHistory, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics, $timeout) {
  $scope.lg = {
    personalNumber: null,
    phoneNumber: null,
    phone: function(s) {
      var p = s.lg.phoneNumber.toString();
      return '+420' + p.substring(p.length - 9, p.length);
    },
    pers: function(s) {
      var p = '000000' + s.lg.personalNumber.toString();
      return s.lg.personalNumber === null ? '' : (p).substring(p.length - 6, p.length);
    }
  };
  $scope.sms = {
    code: null
  };
  $scope.phase = 1;
  $scope.token = null;

  if (window.plugins !== undefined && window.plugins.sim !== undefined) {
    window.plugins.sim.getSimInfo(function (result) {
      if (result.phoneNumber !== undefined) {
        $scope.lg.phoneNumber = result.phoneNumber;
      }
    })
  }

  $scope.phase1 = function(formData) {
    var startRep = function() {
        if (!window.SMS) return;
        console.log('intercept start');
        /*$ionicLoading.show({
          'template': 'Vyčkejte, probíhá přihlašování'
        });

        var seconds = 0;
        $timeout(function() {
          if (seconds > 70*1000) {
            $ionicLoading.hide();
          }

          window.SMS.listSMS({
            box: 'inbox',
            address: ''
          })
        }, 1*1000);*/
    }

    if ($scope.lg.personalNumber === null) {
      $ionicPopup.alert({
        title: 'Chyba',
        template: 'Špatně zadané osobní číslo.<br><small>Osobní číslo OZ má 6 číslic, osobní číslo zaměstnance 4 číslice.</small>'
      });
      return false;
    }
    if ($scope.lg.phoneNumber === null || $scope.lg.phoneNumber.toString().length < 9) {
      $ionicPopup.alert({
        title: 'Chyba',
        template: 'Špatně zadaný telefon.<br><small>Zadejte prosím telefonní číslo, které máte vedené u společnosti Provident.</small>'
      });
      return false;
    }

    UserData.login('no2f', $scope.lg.pers($scope), $scope.lg.phone($scope)).then(function (resultNo2F) {
      switch (resultNo2F.code) {
        case 'OK':
          $scope.token = resultNo2F.token;
          $scope.sms.code = null;
          $scope.phase = 2;
          startRep();
          break;
        case 'REP':
          $ionicPopup.alert({
            title: 'Varování',
            template: 'Opakovaný pokus.<br><small>Prosím, vyčkejte před dalším přihlášením.</small>'
          });
          break;
        case 'INV':
          $scope.lg.personalNumber = null;
          $ionicPopup.alert({
            title: 'Chyba',
            template: 'Špatné přihlašovací údaje.<br><small>Prosím, zkuste znovu.</small>'
          });
          break;
        default:
          $ionicPopup.alert({
            title: 'Varování',
            template: 'Chyba komunikace.<br><small>Vyčkejte chvíli, příp. kontaktuje IT helpdesk.<</small>'
          });
          break;
      }
    });

    $scope.phase2 = function(formData) {
      $scope.sms.code = formData.code;
      if ($scope.sms.code === null || $scope.sms.code.toString().length > 6) {
        $ionicPopup.alert({
          title: 'Chyba',
          template: 'Špatně zadaný kód z SMS.<br><small>Zadejte až 6 číslic, které jste obdrželi pomocí SMS.</small>'
        });
        return false;
      }

      UserData.login('2f', $scope.lg.personalNumber, $scope.lg.phone($scope), $scope.sms.code, $scope.token).then(function (resultNo2F) {
        switch (resultNo2F.code) {
          case 'OK':
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $state.transitionTo('tab.dash', {}, { reload: true, inherit: true, notify: true });
            break;
          case 'INC':
            $scope.sms.code = null;
            $ionicPopup.alert({
              title: 'Varování',
              template: 'Špatně zadaný SMS kód.<br><small>Zkontrolujte přijaté SMS a zadejte znovu.</small>'
            });
            break;
          case 'OLC':
            $scope.sms.code = null;
            $ionicPopup.alert({
              title: 'Varování',
              template: 'Vypršel časový limit kódu.<br><small>Byla vám odeslána nová SMS. Prosím, zkontrolujte znovu.</small>'
            });
            break;
          case 'INV':
            $scope.sms.code = null;
            $scope.lg.personalNumber = null;
            $scope.phase = 1;
            $ionicPopup.alert({
              title: 'Chyba',
              template: 'Špatné přihlašovací údaje.<br><small>Prosím, zkuste znovu.</small>'
            });
            break;
          default:
            $ionicPopup.alert({
              title: 'Varování',
              template: 'Chyba komunikace.<br><small>Vyčkejte chvíli, příp. kontaktuje IT helpdesk.<</small>'
            });
            break;
        }
      });
    };
  };
});

;
