angular.module('cockpit.controllers')

.controller('SmsScoringCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.sc = {
    type: 'NC',
    req: null,
    id: null,
    emp: 'PU',
    idt: 'OP',
    liv: 'VL',
    chi: '0',
  };
  $scope.scList = [
    {text: 'Nový zákazník (NC)', value: 'NC'},
    {text: 'Stávající zákazník (RES)', value: 'RES'}
  ];
  $scope.empList = [
    {text: 'Plný úvazek', value: 'PU'},
    {text: 'Částečný úvazek', value: 'CU'},
    {text: 'Důchodce', value: 'DO'},
    {text: 'OSVČ (podnikatel)', value: 'PO'},
    {text: 'Nezaměstnaný', value: 'NE'},
    {text: 'Invalidní důchodce', value: 'ID'},
    {text: 'Mateřská dovolená', value: 'MD'},
    {text: 'Jiný', value: 'IN'},
  ];
  $scope.livList = [
    {text: 'Vlastník', value: 'VL'},
    {text: 'Žije s rodiči', value: 'ZSR'},
    {text: 'Spoluvlastník', value: 'SVL'},
    {text: 'Nájemník', value: 'NAJ'},
    {text: 'Spolubydlící / podnájemník', value: 'SPO'},
    {text: 'Domov důchodců', value: 'DD'},
    {text: 'Ubytovna', value: 'UBY'},
    {text: 'Jiné', value: 'INE'},
  ];
  $scope.childList = [
    {text: 'žádné dítě', value: '0'},
    {text: '1 dítě', value: '1'},
    {text: '2 děti', value: '2'},
    {text: '3 děti', value: '3'},
    {text: '4 děti', value: '4'},
    {text: '5 dětí', value: '5'},
    {text: '6 a více dětí', value: '6'},
  ];

  var validate = function (arr) {
    var ret = true;
    $.each(arr, function () {
      if (this === null || this === undefined || this === '') {
        ret = false;
      }
    });
    return ret;
  };

  $scope.score = function (data) {
    if ((data.type == 'NC' && validate([data.pin, data.firstName, data.lastName, data.phone, data.emp, data.liv, data.idt, data.idn, data.cb, data.tmfi, data.tmvi, data.bank, data.car, data.chi]))
      || (data.type == 'RES' && validate([data.cid, data.cb, data.tmvi, data.tmfi]))) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
      return;
    }

    $ionicLoading.show();
    try {
      var text = '';

      if (data.type == 'NC') {
        var text = 'rc' + data.pin.toString() +
          '#' + data.firstName +
          '#' + data.lastName +
          '#' + data.phone +
          '#' + data.emp +
          '#' + data.idt +
          '#' + data.idn.toString() +
          '#' + data.cb.toString() +
          '#' + data.tmfi.toString() +
          '#' + data.tmvi.toString() +
          '#' + (data.bank ? "A" : "N") +
          '#' + data.liv +
          '#' + (data.car ? "A" : "N") +
          '#' + data.chi +
          (data.id === null || data.id === undefined ? '' : '#' + data.id.toString()) +
          (data.req === null || data.req === undefined ? '' : '#p' + data.req.toString())
          ;
      } else {
        var text = data.cid.toString() +
          '#' + data.tmfi.toString() +
          '#' + data.tmvi.toString() +
          '#' + data.cb.toString() +
          (data.id === null ? '' : '#' + data.id.toString()) +
          (data.req === null ? '' : '#p' + data.req.toString())
        ;
      }

      $cordovaSms.send('+420606999008', text)
        .then(function() {
          $ionicLoading.hide();
          $cordovaGoogleAnalytics.trackEvent('SMS', 'Scoring');
          $ionicPopup.alert({
            title: 'SMS',
            template: 'Skóring odeslán.<br><small>Odpověď vám přijde v SMS zprávě.</small>'
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
      catch (e)
      {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'SMS se nepodařilo odeslat.<br><small>Zkontrolujte údaje, příp. kontaktuje IT helpdesk.</small>'
        });
      }
  };
})
