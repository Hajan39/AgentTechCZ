angular.module('cockpit.controllers')

/*.controller('LoginCtrl', function($scope, $state, Provident, $ionicLoading, $localstorage, $ionicHistory, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.lg = {
    id: '',
    branch: ''
  };
  $scope.update = function(data) {
    $ionicLoading.show({
      template: '<div><div><ion-spinner icon="ripple" class="spinner-energized" style="width: 128px; height: 128px"></div><div>Probíhá přihlašování (může trvat až 2 minuty)</div></div>'
    });
    //window.device = {uuid: Provident.getUuid()};
    var ridb = "000000000" + data.id.toString();
    var rid = (data.branch.toString() == '6' ? '0006' : data.branch.toString()) + ridb.substring(ridb.length - 9, ridb.length);
    var text = "#ACAT;" + rid + ";" + device.uuid + ";";

      $cordovaSms.send('+420606999008', text).then(function() {
        var checker = function (i, checker) {
          Provident.verifyAuth(device.uuid, function () {
            $ionicLoading.hide();
            $cordovaGoogleAnalytics.trackEvent('Login', 'Success');
            $ionicHistory.nextViewOptions({
              disableBack: true
            });
            $scope.lg = {
              id: '',
              branch: ''
            };
            $state.go('tab.dash');
          }, function (msg) {
            i += 1;
            if (msg == null || i >= 3) {
              $ionicLoading.hide();
              $cordovaGoogleAnalytics.trackEvent('Login', 'Invalid-WrongRepreId');
              $ionicPopup.alert({
                title: 'Upozornění',
                template: 'Přihlášení bylo neúspěšné.<br><small>Prosím opakujte znovu. V případě potíží kontaktuje IT helpdesk (ID <code>'+device.uuid+'</code>).</small>'
              });
            } else if (msg != null) {
              $ionicLoadinghide();
              $cordovaGoogleAnalytics.trackEvent('Login', 'Invalid-ServerError');
              $ionicPopup.alert({
                title: 'Upozornění',
                template: 'Přihlášení bylo neúspěšné.<br><small>Zkontrolujte své připojení k internetu. V případě potíží kontaktuje IT helpdesk (ID <code>'+device.uuid+'</code>, chyba: <code>'+msg+'</code>).</small>'
              });
            } else {
              window.setTimeout(checker, 3000, i, checker);
            }
          }, function (error) {
              $cordovaGoogleAnalytics.trackEvent('Login', 'Invalid-Error');
              $ionicPopup.alert({
                title: 'Chyba',
                template: 'Přihlášení bylo neúspěšné.<br><small>Zkontrolujte své připojení k internetu. V případě potíží kontaktuje IT helpdesk (ID <code>'+device.uuid+'</code>).</small>'
              });
          });
        };

        window.setTimeout(checker, 3000, 1, checker);
      }, function (error) {
              $cordovaGoogleAnalytics.trackEvent('Login', 'Invalid-Error');
          $ionicPopup.alert({
            title: 'Chyba',
            template: 'Přihlášení bylo neúspěšné.<br><small>V případě potíží kontaktuje IT helpdesk (ID <code>'+device.uuid+'</code>).</small>'
          });
      });
  };
})*/

.controller('LoginCtrl', function($scope, $state, UserData, $ionicLoading, $ionicHistory, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.lg = {
    personalNumber: null,
    phoneNumber: null,
    phone: function(s) {
      var p = s.lg.phoneNumber.toString();
      return '+420' + p.substring(p.length - 9, p.length);
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
    if ($scope.lg.personalNumber === null || ($scope.lg.personalNumber.toString().length !== 4 && $scope.lg.personalNumber.toString().length !== 6)) {
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

    UserData.login('no2f', $scope.lg.personalNumber, $scope.lg.phone($scope)).then(function (resultNo2F) {
      switch (resultNo2F.code) {
        case 'OK':
          $scope.token = resultNo2F.token;
          $scope.sms.code = null;
          $scope.phase = 2;
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
            $state.go('tab.dash');
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
