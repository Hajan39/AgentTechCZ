angular.module('starter.controllers', ['cockpit.services'])

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
