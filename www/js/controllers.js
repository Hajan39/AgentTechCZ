angular.module('starter.controllers', ['cockpit.services'])

.controller('ScNcCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.score = function (data) {
    $ionicLoading.show();

    if (data.idn == null || data.cb == null || data.tmfi == null || data.tmvi == null) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
    }

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

    $cordovaSms.send('+420606999008', text)
      .then(function() {
        $ionicLoading.hide();
        $cordovaGoogleAnalytics.trackEvent('SMS', 'Scoring-NC');
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
  };
  $scope.sc = {
    req: null,
    id: null,
    cb: 'a',
    emp: 'PU',
    idt: 'OP',
    liv: 'VL',
    chi: '0',
  };
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
  /*

  */
})

.controller('ScResCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.score = function (data) {
    $ionicLoading.show();

    if (data.cid == null || data.tmfi == null || data.tmvi == null || data.cb == null) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
    }

    var text = data.cid.toString() +
      '#' + data.tmfi.toString() +
      '#' + data.tmvi.toString() +
      '#' + data.cb.toString() +
      (data.id === null ? '' : '#' + data.id.toString()) +
      (data.req === null ? '' : '#p' + data.req.toString())
    ;

    $cordovaSms.send('+420606999008', text)
      .then(function() {
        $ionicLoading.hide();
        $cordovaGoogleAnalytics.trackEvent('SMS', 'Scoring-RES');
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
  };
  $scope.sc = {
    req: null,
    id: null,
    cb: 'a'
  };
})

.controller('PtpCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.ptp = function (data) {
    $ionicLoading.show();

    if (data.fr == null || data.pay == null || data.cid == null) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Dohodu nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
    }

    var text = "#DO#" + data.cid.toString() +
      "#" + data.fr.toString() + '#' +
      data.pay.toString() + '#' + moment(data.end).format('DDMMYYYY') + '#'
      ;

    $cordovaSms.send('+420606999008', text)
      .then(function() {
        $ionicLoading.hide();
        $cordovaGoogleAnalytics.trackEvent('SMS', 'PTP');
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Dohoda vytvořena.'
        });
        $state.go('tab.dash');
      }, function() {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'SMS se nepodařilo odeslat.<br><small>Zkontrolujte údaje, příp. kontaktuje IT helpdesk.</small>'
        });
      });
  };
  $scope.sc = {
    fr: 'J'
  };
})

.controller('AgCtrl', function($state, $scope, Provident, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.product = {
    term: 'WE-45',
    type: 'HC',
    discount: 'S0',
    issue: null
  }
  $scope.showIssue = function (product) {
    var data = Provident.productValidIssues;
    if (data[product.term] == undefined || data[product.term][product.type] == undefined || data[product.term][product.type][product.discount] == undefined) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Nesprávná kombinace parametrů.<br><small>Takovýto produkt nemáme v nabídce.</small>'
      });
      return;
    }

    var row = data[product.term][product.type][product.discount];

    if ($.inArray(product.issue, row) == -1) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Nesprávná kombinace parametrů.<br><small>Výše půjčky není k dispozici pro tento produkt.</small>'
      });
      return;
    }

    $state.go('tab.product1', {
      discount: product.discount,
      type: product.type,
      term: product.term,
      issue: product.issue
    });
  };
  $scope.showSummary = function (product) {
    var data = Provident.productValidIssues;
    if (data[product.term] == undefined || data[product.term][product.type] == undefined || data[product.term][product.type][product.discount] == undefined) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Nesprávná kombinace parametrů.<br><small>Takovýto produkt nemáme v nabídce.</small>'
      });
      return;
    }

    $state.go('tab.table', {
      discount: product.discount,
      type: product.type,
      term: product.term,
    });
  };
})

.controller('Product1Ctrl', function($stateParams, $state, $scope, Provident, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.d = Provident.productData[$stateParams.term][$stateParams.type][$stateParams.discount][$stateParams.issue];
  var termCount = $stateParams.term;
  $scope.d.Term = termCount.substring(termCount.indexOf('-') + 1);
  $scope.d.Way = $scope.d.Type == 'HC' ? 'Hotovostní' : 'Bezhotovostní';

  $scope.continue = function () {
    $state.go('tab.product2', $stateParams);
  };
})

.controller('ProductTableCtrl', function($stateParams, $state, $scope, Provident, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  var data = Provident.productValidIssues;
  var termCount = $stateParams.term;
  $scope.gl = {
    term: termCount.substring(termCount.indexOf('-') + 1),
    freq: termCount.substring(0, termCount.indexOf('-')) == 'MO' ? 'měsíců' : 'týdnů',
    discount: $stateParams.discount
  };
  $scope.table = [];
  var row = data[$stateParams.term]['HC'][$stateParams.discount];

  $.each(row, function () {
    $scope.table.push({
      IssueValue: Provident.productData[$stateParams.term]['HC'][$stateParams.discount][this].IssueValue,
      hc: Provident.productData[$stateParams.term]['HC'][$stateParams.discount][this].RegularInstalment,
      mt: Provident.productData[$stateParams.term]['MT'][$stateParams.discount][this].RegularInstalment,
    });
  });

  console.log($scope.table);

  $scope.issue = function (issue, type) {
    $state.go('tab.product1', {
      discount: $stateParams.discount,
      type: type,
      term: $stateParams.term,
      issue: issue
    });
  };
})

.controller('FriendsCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.sale = {
    date: new Date(),
    term: '45',
    type: 'HC'
  };
  $scope.issue = function (data) {
    $ionicLoading.show();

    var month = data.date.getMonth() + 1;
    var year = data.date.getFullYear();
    if (month == 13) {
      month = 1;
      year += 1;
    }

    if (data.pin == null || data.issue == null || data.date == null || data.term == null) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
    }

    var text = "#PVYP;rc" + data.pin.toString() +
      ";d" + data.date.getDate() + "." + month + "." + year
      + ";v" + data.issue.toString()
      + ";s" + data.term.toString()
      + ";t" + (data.type == "MT" ? "B" : "H");

    $cordovaSms.send('+420606999008', text)
      .then(function() {
        $ionicLoading.hide();
        $cordovaGoogleAnalytics.trackEvent('SMS', 'Sales');
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Prodejní SMS odeslána.<br><small>Dobrá práce!</small>'
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
