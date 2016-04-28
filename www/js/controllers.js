angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Provident, $ionicPopup, $ionicHistory, $state) {
  $scope.doRefresh = function() {
      Provident.agentInfo(device.uuid, function (data) {
        $scope.agent = data;
        $scope.$apply();
        $scope.$broadcast('scroll.refreshComplete');
      });
      Provident.agentPlans(device.uuid, function (data) {
        $scope.plans = data.data;
        $scope.month = data.month;
        $scope.$apply();
        $scope.$broadcast('scroll.refreshComplete');
      });
  };
  $scope.doLogout = function() {
    $ionicPopup.confirm({
      title: 'Odhlášení',
      template: 'Skutečně se chcete odhlásit z aplikace OZ Cockpit?'
    }).then(function (res) {
      if (res) {
        Provident.logout();
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('login');
      }
    });
  };
  
  Provident.agentInfo(device.uuid, function (data) {
    $scope.agent = data;
  }, true);
  Provident.agentPlans(device.uuid, function (data) {
    $scope.plans = data.data;
    $scope.month = data.month;
  }, true);
  
  setTimeout($scope.doRefresh, 3000);
})

.filter('agencyId', function() {
  return function(id) {
    return typeof id === 'string' ? id.replace('00000', '-') : id;
  }
})

.controller('ScNcCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.score = function (data) {
    $ionicLoading.show();
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
})

.controller('ScResCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.score = function (data) {
    $ionicLoading.show();
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
})

.controller('LoginCtrl', function($scope, $state, Provident, $ionicLoading, $localstorage, $ionicHistory, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
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
            if (msg == null && i >= 3) {
              $ionicLoading.hide();
              $cordovaGoogleAnalytics.trackEvent('Login', 'Invalid-WrongRepreId');
              $ionicPopup.alert({
                title: 'Upozornění',
                template: 'Přihlášení bylo neúspěšné.<br><small>Aplikace OZ Cockpit je dostupná pouze pro obchodní zástupce s právem odeslat scoring. V případě potíží kontaktuje IT helpdesk (ID <code>'+device.uuid+'</code>).</small>'
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
})

.controller('AccountCtrl', function($scope, $state, $ionicLoading, $localstorage, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  $scope.sc = {
    nc: null,
    obn: null,
    sub: null,
    ref: null,
    pu: null,
    sal: null,
    coll: null,
    vz: null,
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
  };

  $scope.report = function (data) {
    if (data.nc === null || data.obn === null || data.sub === null || data.ref === null || data.pu === null || data.sal === null || data.coll === null || data.vz === null) {
      $ionicPopup.alert({
            title: 'SMS',
            template: 'Nebyly vyplněny povinné položky.<br><small>Prvních osm parametrů je nutno vyplnit pro odeslání výsledků.</small>'
          });
      return;
    }
    
    $ionicLoading.show();

    var text = "#ROZ" +
      ';' + $localstorage.getObject('agentInfo').sid +
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