angular.module('cockpit.controllers')

.controller('SaleCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics, PRODUCTS, UserData) {
  var validatePin = function(pin) {
    try {
      var pin = pin.toString();
      var year = parseInt(pin.substring(0, 2));
      var month = parseInt(pin.substring(2, 4));
      var day = parseInt(pin.substring(4, 6));
      var control = pin.substring(6);

      var error = false;

      if (year > 53 && control.length != 4) {
          error = true;
      }
      control = control.trim();

      //control cannot be 000 for 9 characters pin
      if (control.length == 3 && control == "000") {
          error = true;
      }

      year += year < 54 && control.length == 4 ? 2000 : 1900;

      if (year > new Date().getFullYear() - 16) {
          error = true;
      }

      if (month > 70) {
          month -= 70;
      } else if (month > 50) {
          month -= 50;
      } else if (month > 20) {
          month -= 20;
      }

      try {
          var bz = new Date(year, month - 1, day);
          if (bz.getDate() != day) {
            error = true;
          } else if (bz.getMonth() != (month - 1)) {
            error = true;
          } else if (bz.getFullYear() != year) {
            error = true;
          }
      } catch(e) {
          error = true;
      }


      if (year > 1953 && !error) {
          var bz = parseInt(pin.substring(0, 9));
          var ps = bz % 11;

          if (ps == 10) {
              if (pin[9] != '0') {
                  error = true;
              }
          } else {
              bz = parseInt(pin);
              ps = bz % 11;
              if (ps != 0) {
                  error = true;
              }
          }
      }

      //return opposite of error -> if validate returns true than PIN is valid
      return !error;
    } catch(e) {
      return false;
    }
  };

  $scope.sc = {
      cat: '',
      ref: 'n'
  };

  var doUpdateView = function(ref) {
    $scope.catList = [];
    $scope.termList = [];
    $scope.sc.group = $scope.sc.cat == '' ? '' : ($scope.sc.cat.substring(0, 1) == 'M' ? 'MT' : 'HC');
    $.each(PRODUCTS.categories, function(catKey, products) {
      $scope.catList.push({text: catKey, value: catKey});
      $.each(products, function(prodKey, product) {
        if ($scope.sc.cat == catKey) {
          $scope.termList.push({text: product.term + ' ' + (product.termType == 'MO' ? 'měsíců' : 'týdnů'), value: product.term});
        }
      });
    });
    $scope.computedPaidOutValue = ($scope.sc.issueValue ? $scope.sc.issueValue : 0) -
      (($scope.sc.refValue && ref =='a') ? $scope.sc.refValue : 0);
    console.log($scope.computedPaidOutValue);
  };
  $scope.updateView = function () {
    doUpdateView($scope.sc.ref);
  };
  $scope.updateClickView = function() {
    doUpdateView($scope.sc.ref == 'a' ? 'n' : 'a');
  };
  $scope.updateView();

  $scope.payMt = function(data) {
      $ionicLoading.show();
      $scope.updateView();
      console.log(data);

      if (data.pin == null || data.date == null || data.term == null || data.scoringId == null || data.agreementNumber == null || data.issueValue == null || data.bankCode == null || data.bankNumber == null
      || (data.ref === 'a' && (data.refAgreementNumber == null || data.refValue == null))) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Prodej nelze nahlásit.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
        });
        return;
      }

      if (!validatePin(data.pin)) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Prodej nelze nahlásit.<br><small>Rodné číslo není validní.</small>'
        });
        return;
      }

      var month = data.date.getMonth() + 1;
      var year = data.date.getFullYear();
      if (month == 13) {
        month = 1;
        year += 1;
      }

      var text = "#PVYP;rc" + data.pin.toString() +
        ";d" + data.date.getDate() + "." + month + "." + year
        + ";v" + $scope.computedPaidOutValue.toString()
        + ";s" + data.term.toString()
        + ";tB";

      $cordovaSms.send('+420606999008', text)
        .then(function() {
          $ionicLoading.hide();
          $cordovaGoogleAnalytics.trackEvent('SMS', 'Sales');
          $ionicPopup.alert({
            title: 'SMS',
            template: 'Prodejní SMS odeslána.<br><small>Dobrá práce!</small>'
          });
          $state.go('tab.dash');
          $scope.sc = {
              cat: '',
              ref: 'n'
          };
        }, function() {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'SMS',
            template: 'SMS se nepodařilo odeslat.<br><small>Zkontrolujte údaje, příp. kontaktuje IT helpdesk.</small>'
          });
        });

      var mtrRext = "#MTR#" + data.scoringId.toString()
        + "#" + data.agreementNumber.toString()
        + "#" + data.issueValue.toString()
        + "#" + ((data.refAgreementNumber == null || data.ref == 'n') ? "0" : data.refAgreementNumber.toString())
        + "#" + ((data.refValue == null || data.ref == 'n') ? "0" : data.refValue.toString())
        + "#" + (data.bankPrefix == null ? "0" : data.bankPrefix.toString())
        + "#" + data.bankNumber.toString()
        + "#" + data.bankCode.toString()
        + "#" + UserData.getToken();


              $cordovaSms.send('+420606999008', mtrRext)
                .then(function() {
                  $ionicLoading.hide();
                  $cordovaGoogleAnalytics.trackEvent('SMS', 'MTR');
                  $ionicPopup.alert({
                    title: 'SMS',
                    template: 'Registrace MODRÉ půjčky dokončena.<br><small>Vyčkejte na odpovědní SMS!</small>'
                  });
                  $state.go('tab.dash');
                  $scope.sc = {
                      cat: '',
                      ref: 'n'
                  };
                }, function() {
                  $ionicLoading.hide();
                  $ionicPopup.alert({
                    title: 'SMS',
                    template: 'SMS se nepodařilo odeslat.<br><small>Zkontrolujte údaje, příp. kontaktuje IT helpdesk.</small>'
                  });
                });

    };

  $scope.payHc = function(data) {
      $ionicLoading.show();

      if (data.pin == null || data.paidOutValue == null || data.date == null || data.term == null ) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Prodej nelze nahlásit.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
        });
        return;
      }

      if (!validatePin(data.pin)) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'SMS',
          template: 'Prodej nelze nahlásit.<br><small>Rodné číslo není validní.</small>'
        });
        return;
      }

      var month = data.date.getMonth() + 1;
      var year = data.date.getFullYear();
      if (month == 13) {
        month = 1;
        year += 1;
      }

      var text = "#PVYP;rc" + data.pin.toString() +
        ";d" + data.date.getDate() + "." + month + "." + year
        + ";v" + data.paidOutValue.toString()
        + ";s" + data.term.toString()
        + ";tH";

      $cordovaSms.send('+420606999008', text)
        .then(function() {
          $ionicLoading.hide();
          $cordovaGoogleAnalytics.trackEvent('SMS', 'Sales');
          $ionicPopup.alert({
            title: 'SMS',
            template: 'Prodejní SMS odeslána.<br><small>Dobrá práce!</small>'
          });
          $state.go('tab.dash');
          $scope.sc = {
              cat: '',
              ref: 'n'
          };
        }, function() {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'SMS',
            template: 'SMS se nepodařilo odeslat.<br><small>Zkontrolujte údaje, příp. kontaktuje IT helpdesk.</small>'
          });
        });
    };
})

.controller('SmsScoringCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  var validatePin = function(pin) {
    try {
      var pin = pin.toString();
      var year = parseInt(pin.substring(0, 2));
      var month = parseInt(pin.substring(2, 4));
      var day = parseInt(pin.substring(4, 6));
      var control = pin.substring(6);

      var error = false;

      if (year > 53 && control.length != 4) {
          error = true;
      }
      control = control.trim();

      //control cannot be 000 for 9 characters pin
      if (control.length == 3 && control == "000") {
          error = true;
      }

      year += year < 54 && control.length == 4 ? 2000 : 1900;

      if (year > new Date().getFullYear() - 16) {
          error = true;
      }

      if (month > 70) {
          month -= 70;
      } else if (month > 50) {
          month -= 50;
      } else if (month > 20) {
          month -= 20;
      }

      try {
          var bz = new Date(year, month - 1, day);
          if (bz.getDate() != day) {
            error = true;
          } else if (bz.getMonth() != (month - 1)) {
            error = true;
          } else if (bz.getFullYear() != year) {
            error = true;
          }
      } catch(e) {
          error = true;
      }


      if (year > 1953 && !error) {
          var bz = parseInt(pin.substring(0, 9));
          var ps = bz % 11;

          if (ps == 10) {
              if (pin[9] != '0') {
                  error = true;
              }
          } else {
              bz = parseInt(pin);
              ps = bz % 11;
              if (ps != 0) {
                  error = true;
              }
          }
      }

      //return opposite of error -> if validate returns true than PIN is valid
      return !error;
    } catch(e) {
      return false;
    }
  };

  var validateCid = function(cid) {
    var cid = cid.toString();
    try {
      return /^(6|10(0|1|2)[0-9])((-|000)\d{6}|(-|0000)\d{5})$/.test(cid);
    } catch(e) {
      return false;
    }
    return true;
  };

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
    {text: 'Dohoda o pracovní činnosti (DPČ)', value: 'DPC'},
    {text: 'Dohoda o provedení práce (DPP)', value: 'DPP'}
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
    {text: 'žádná osoba', value: '0'},
    {text: '1 osoba', value: '1'},
    {text: '2 osoby', value: '2'},
    {text: '3 osoby', value: '3'},
    {text: '4 osoby', value: '4'},
    {text: '5 osob', value: '5'},
    {text: '6 a více osob', value: '6'},
  ];
  $scope.maritalList = [
    {text: 'svobodná/svobodný', value: 'SV'},
    {text: 'vdaná/ženatý/reg. partnerství', value: 'ZVR'},
    {text: 'rozvedená/rozvedený', value: 'RO'},
    {text: 'partnerka/partner', value: 'PAR'},
    {text: 'vdova/vdovec', value: 'VD'}
  ];
  $scope.educationList = [
    {text: 'bez vzdělání', value: 'BV'},
    {text: 'základní', value: 'ZAK'},
    {text: 'učňovské', value: 'UC'},
    {text: 'středoškolské', value: 'STR'},
    {text: 'vyšší odborné', value: 'VO'},
    {text: 'vysokoškolské', value: 'VS'}
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
    if ((data.type == 'NC' && !validate([data.pin, data.firstName, data.lastName, data.phone, data.emp, data.liv, data.idt, data.idn, data.cb, data.req, data.tmfi, data.tmvi, data.bank, data.car, data.chi, data.eme, data.pmi, data.mar, data.edu, data.mfih, data.otherMonthlyIncome]))
      || (data.type == 'RES' && !validate([data.cid, data.firstName, data.lastName, data.phone, data.emp, data.liv, data.idt, data.idn, data.cb, data.req, data.tmfi, data.tmvi, data.bank, data.car, data.chi, data.eme, data.pmi, data.mar, data.edu, data.mfih, data.otherMonthlyIncome]))) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
      return;
    }

    if (data.type == 'NC' && !validatePin(data.pin)) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Rodné číslo není validní.</small>'
      });
      return;
    }

    if (data.type == 'RES' && !validateCid(data.cid)) {
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Skóring nelze odeslat.<br><small>Číslo zákazníka není validní.</small>'
      });
      return;
    }

    $ionicLoading.show();
    try {
      var text = '';
      var normalize = function(str) {
      	// UTF8 "ěščřžýáíéťúůóďňľĺ"
      	convFromL = String.fromCharCode(283,353,269,345,382,253,225,237,233,357,367,250,243,271,328,318,314);
      	// UTF8 "escrzyaietuuodnll"
      	convToL = String.fromCharCode(101,115,99,114,122,121,97,105,101,116,117,117,111,100,110,108,108);

      	// zmenseni a odstraneni diakritiky
      	str = str.toLowerCase();
      	str = strtr(str,convFromL,convToL);

      	return str;
      };
      var strtr = function strtr(s, from, to) {
      	out = new String();
      	// slow but simple :^)
      	top:
      	for(i=0; i < s.length; i++) {
      		for(j=0; j < from.length; j++) {
      			if(s.charAt(i) == from.charAt(j)) {
      				out += to.charAt(j);
      				continue top;
      			}
      		}
      		out += s.charAt(i);
      	}
      	return out;
      };

      if (data.type == 'NC') {
        var text = 'rc' + data.pin.toString() +
          '#' + normalize(data.firstName) +
          '#' + normalize(data.lastName) +
          '#' + data.phone +
          '#' + data.emp +
          '#' + data.idt +
          '#' + data.idn.toString() +
          '#' + data.cb.toString() +
          '#' + data.tmfi.toString() +
          '#' + data.tmvi.toString() +
          '#' + data.eme.toString() +
          '#' + data.pmi.toString() +
          '#' + data.bank +
          '#' + data.liv +
          '#' + data.mar +
          '#' + data.edu +
          '#' + data.car +
          '#' + data.chi +
          '#' + data.otherMonthlyIncome +
          '#' + data.mfih +
          '#p' + (data.req.toString()) +
          (data.id === null || data.id === undefined ? '' : '#' + data.id.toString())
          ;
      } else {
        var text = data.cid.toString() +
          '#' + normalize(data.firstName) +
          '#' + normalize(data.lastName) +
          '#' + data.phone +
          '#' + data.emp +
          '#' + data.idt +
          '#' + data.idn.toString() +
          '#' + data.cb.toString() +
          '#' + data.tmfi.toString() +
          '#' + data.tmvi.toString() +
          '#' + data.eme.toString() +
          '#' + data.pmi.toString() +
          '#' + data.bank +
          '#' + data.liv +
          '#' + data.mar +
          '#' + data.edu +
          '#' + data.car +
          '#' + data.chi +
          '#' + data.otherMonthlyIncome +
          '#' + data.mfih +
          '#p' + (data.req.toString()) +
          (data.id === null || data.id === undefined ? '' : '#' + data.id.toString())
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
          $scope.sc = {
            type: 'NC',
            req: null,
            id: null,
            emp: 'PU',
            idt: 'OP',
            liv: 'VL',
            chi: '0',
          };
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

.controller('PtpCtrl', function($scope, $ionicLoading, $state, $cordovaSms, $ionicPopup, $cordovaGoogleAnalytics) {
  var validateCid = function(cid) {
    var cid = cid.toString();
    try {
      return /^(6|10(0|1|2)[0-9])((-|000)\d{6}|(-|0000)\d{5})$/.test(cid);
    } catch(e) {
      return false;
    }
    return true;
  };

  $scope.ptp = function (data) {
    $ionicLoading.show();

    if (data.fr == null || data.pay == null || data.cid == null) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Dohodu nelze odeslat.<br><small>Zkontrolujte, že jste vyplnili všechny povinné parametry.</small>'
      });
      return;
    }

    if (!validateCid(data.cid)) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'SMS',
        template: 'Dohodu nelze odeslat.<br><small>Číslo zákazníka není validní.</small>'
      });
      return;
    }

    var cid = data.cid.toString()

    console.log(cid)

    if (cid.length === 7 || cid.length == 10) {
      cid = cid.replace('-', '0000')
    } else if (cid.length === 8 || cid.length === 11) {
      cid = cid.replace('-', '000')
    }

    var text = "#DO#" + cid.toString() +
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
        $scope.sc = {
          fr: 'J'
        };
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
