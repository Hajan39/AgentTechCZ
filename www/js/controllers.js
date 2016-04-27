angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Provident) {
  $scope.doRefresh = function() {
      Provident.agentInfo(device.uuid, function (data) {
        $scope.agent = data;
        $scope.$apply();
        $scope.$broadcast('scroll.refreshComplete');
      });
      Provident.agentPlans(device.uuid, function (data) {
        $scope.plans = data;
        $scope.$apply();
        $scope.$broadcast('scroll.refreshComplete');
      });/*
      $scope.plans = [
        {
          description: 'Prodeje',
          planValue: 50000,
          actualValue: 55000
        },
        {
          description: 'Výběry',
          planValue: 40000,
          actualValue: 55000
        },
        {
          description: 'NC',
          planValue: 2,
          actualValue: 1
        }
      ];
      $scope.agent = {
        name: 'Vojtěch Zicha',
        agency: '6-1125',
        branch: 'Ostrava'
      };*/
  };
  
  Provident.agentInfo(device.uuid, function (data) {
    $scope.agent = data;
      $scope.$apply();
  }, true);
  Provident.agentPlans(device.uuid, function (data) {
    $scope.plans = data;
      $scope.$apply();
  }, true);
  
  setTimeout($scope.doRefresh, 3000);
})

.controller('ChatsCtrl', function($scope, $ionicLoading, $state) {
  $scope.score = function (data) {
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá odeslání SMS',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    var text = "rc" + data.pin.toString() +
      ",op" + data.op.toString()
      + "," + (data.phone ? "mt" : "nt")
      + "," + (data.emp.substring(0, 2) === "mz" ? "mz" : "nz")
      + ",p" + data.loan.toString()
      + ",id" + (data.id == undefined ? "000" : data.id.toString())
      + ",t:" + data.phonen
      + ",m:" + data.name
      + ",p:" + data.surname;
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      alert('Skóring odeslán!');
      $scope.loading.hide();
      $state.go('tab.dash', {}, {location: 'replace'});
    }, function (error) {
      alert('Nepodařilo se odeslat SMS.');
      $scope.loading.hide();
    });
  }
})

.controller('ScNcCtrl', function($scope, $ionicLoading, $state) {
  $scope.score = function (data) {
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá odeslání SMS',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
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
      (data.id === null ? '' : '#' + data.id.toString()) +
      (data.req === null ? '' : '#p' + data.req.toString())
    ;
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      alert('Skóring odeslán!');
      $scope.loading.hide();
      $state.go('tab.dash', {}, {location: 'replace'});
    }, function (error) {
      alert('Nepodařilo se odeslat SMS.');
      $scope.loading.hide();
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

.controller('ScResCtrl', function($scope, $ionicLoading, $state) {
  $scope.score = function (data) {
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá odeslání SMS',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    var text = data.cid.toString() + 
      '#' + data.tmfi.toString() +
      '#' + data.tmvi.toString() +
      '#' + data.cb.toString() +
      (data.id === null ? '' : '#' + data.id.toString()) +
      (data.req === null ? '' : '#p' + data.req.toString())
    ;
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      alert('Skóring odeslán!');
      $scope.loading.hide();
      $state.go('tab.dash', {}, {location: 'replace'});
    }, function (error) {
      alert('Nepodařilo se odeslat SMS.');
      $scope.loading.hide();
    });
  };
  $scope.sc = {
    req: null,
    id: null,
    cb: 'a'
  };
})

.controller('PtpCtrl', function($scope, $ionicLoading, $state) {
  $scope.ptp = function (data) {
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá odeslání SMS',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    var text = "#DO#" + data.cid.toString() +
      "#" + data.fr.toString() + '#' +
      data.pay.toString() + '#' + moment(data.end).format('DDMMYYYY') + '#'
      ;
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      alert('PTP odesláno!');
      $scope.loading.hide();
      $state.go('tab.dash', {}, {location: 'replace'});
    }, function (error) {
      alert('Nepodařilo se odeslat SMS.');
      $scope.loading.hide();
    });
  };
  $scope.sc = {
    fr: 'J'
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AgCtrl', function($state, $scope, Provident) {
  $scope.product = {
    term: 'WE-45',
    type: 'HC',
    discount: 'S0',
    issue: null
  }
  $scope.showIssue = function (product) {
    var data = Provident.productValidIssues;
    if (data[product.term] == undefined || data[product.term][product.type] == undefined || data[product.term][product.type][product.discount] == undefined) {
      alert('Nesprávná kombinace parametrů');
      return;
    }

    var row = data[product.term][product.type][product.discount];

    if ($.inArray(product.issue, row) == -1) {
      alert('Nesprávná výše půjčky');
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
      alert('Nesprávná kombinace parametrů');
      return;
    }

    $state.go('tab.table', {
      discount: product.discount,
      type: product.type,
      term: product.term,
    });
  };
})

.controller('Product1Ctrl', function($stateParams, $state, $scope, Provident) {
  $scope.d = Provident.productData[$stateParams.term][$stateParams.type][$stateParams.discount][$stateParams.issue];
  var termCount = $stateParams.term;
  $scope.d.Term = termCount.substring(termCount.indexOf('-') + 1);
  $scope.d.Way = $scope.d.Type == 'HC' ? 'Hotovostní' : 'Bezhotovostní';

  $scope.continue = function () {
    $state.go('tab.product2', $stateParams);
  };
})

.controller('ProductTableCtrl', function($stateParams, $state, $scope, Provident) {
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
    //alert('Issue: ' + issue + '')
    $state.go('tab.product1', {
      discount: $stateParams.discount,
      type: type,
      term: $stateParams.term,
      issue: issue
    });
  };
})

.controller('FriendsCtrl', function($scope, $ionicLoading, $state) {
  $scope.sale = {
    date: new Date()
  };
  $scope.issue = function (data) {
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá odeslání SMS',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
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
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      alert('Prodejní SMS odeslána!');
      $scope.loading.hide();
      $state.go('tab.dash', {}, {location: 'replace'});
    }, function (error) {
      alert('Nepodařilo se odeslat SMS.');
      $scope.loading.hide();
    });
  }
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('LoginCtrl', function($scope, $state, Provident, $ionicLoading, $localstorage, $ionicViewService, $location) {
  $scope.lg = {
    id: '',
    branch: ''
  };
  $scope.update = function(data) {
    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    //window.device = {uuid: Provident.getUuid()};
    var ridb = "000000000" + data.id.toString();
    var rid = (data.branch.toString() == '6' ? '0006' : data.branch.toString()) + ridb.substring(ridb.length - 9, ridb.length);
    var text = "#ACAT;" + rid + ";" + device.uuid + ";";
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      //alert('sent');
      var checker = function (i, checker) {
      //alert('check');
        Provident.verifyAuth(device.uuid, function () {
          //alert('loading');
          $scope.loading.hide();
          //alert('loading 2');
          $ionicViewService.nextViewOptions({
            disableBack: true
          });
          $state.go('tab.dash');
          //alert('loading 3');
        }, function (msg) {
          i += 1;
          if (msg == null && i < 10) {
            window.setTimeout(checker, 20000, i, checker);
          } else if (msg == null && i >= 10) {
          $scope.loading.hide();
            alert('Přihlášení bylo neúspěšné (zkontrolujte připojení k internetu, příp. kontaktujte IT helpdesk.)');
          } else if (msg != null) {
            $scope.loading.hide();
            alert(msg);
          }
        });
      };
        window.setTimeout(checker, 3000, 1, checker);
        return false;
    }, function (error) {
      alert('Nepodařilo se odeslat SMS zprávu, prosím zkuste znovu.');
    });
  };
})

.controller('AccountCtrl', function($scope, $state, $ionicLoading, $localstorage) {
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
      alert('Nevyplněná povinná data.');
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Probíhá odeslání SMS',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });

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

    $scope.loading = $ionicLoading.show({
      content: 'Probíhá přihlašování (může trvat až 2 minuty)',
      animation: 'fade-in',
      showDelay: 500,
      showBackdrop: true
    });
    sms.sendMessage({phoneNumber: '+420606999008', textMessage: text}, function(message) {
      alert('Reportovací SMS odeslána!');
      $scope.loading.hide();
      $state.go('tab.dash', {}, {location: 'replace'});
    }, function (error) {
      alert('Nepodařilo se odeslat SMS.');
      $scope.loading.hide();
    });
  }
});

// 30c468e6f382845b
// 30c468e6f382845b