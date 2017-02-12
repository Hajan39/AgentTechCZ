angular.module('starter')

.directive('groupedRadio', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      value: '=groupedRadio'
    },
    link: function(scope, element, attrs, ngModelCtrl) {
      element.addClass('button');
      element.on('click', function(e) {
        scope.$apply(function() {
          ngModelCtrl.$setViewValue(scope.value);
        });
      });

      scope.$watch('model', function(newVal) {
        element.removeClass('button-balanced');
        if (newVal === scope.value) {
          element.addClass('button-balanced');
        }
      });
    }
  };
})

.filter('termType', function() {
  return function(type) {
    if (type == 'MO') return 'měsíců';
    else return 'týdnů';
  };
})

.filter('termType2', function() {
  return function(type) {
    console.log(type);
    if (type == 'MO') return 'měsíčně';
    else return 'týdně';
  };
})

.filter('agencyId', function() {
  return function(id) {
    if (id == undefined || id == null) return '';
    id = id.toString();
    if (id.length == 0) return id;

    if (id[0] == '6') {
      return '6-' + id.substring(id.length - 4);
    } else {
      return id.substring(0, 4) + '-' + id.substring(id.length - 4);
    }
  };
})

.filter('weekId', function() {
  return function(id) {
    if (id == null || id == undefined) return '';
    id = id.toString();
    return id.length == 6 ? id.substring(0, 4) + '/' + id.substring(4) : id;
  };
})

.filter('monthId', function() {
  return function(id) {
    if (id == null || id == undefined) return '';
    id = id.toString();
    return id.length == 6 ? id.substring(0, 4) + '/' + id.substring(4) : id;
  };
})

.filter('leadDate', function() {
  return function (value) {
    value = moment(value)

    return value.format('D. M. HH:mm')
  }
})

.filter('leadAssignedTo', function() {
  return function (value) {
    value = value + '' // make sure it's a string

    if (/^[0-9]+$/.test(value)) {
      // Agency Id
      if (value[0] === '6') {
        return value[0] + '-' + value.substring(value.length - 4, value.length)
      } else {
        return value.substring(0, 4) + '-' + value.substring(value.length - 4, value.length)
      }
    } else {
      return value
    }
  }
})

.filter('num', function() {
  return function(number, decPlaces) {
    if (decPlaces === undefined) {
      decPlaces = 0;
    }

    if (number === undefined) {
      return undefined;
    }

    var p = number.toFixed(decPlaces).split('.');
    return p[0].split('').reverse().reduce(function(acc,num,i,orig) {
      return num === '-' ? acc : num + (i && !(i % 3) ? ' ' : '') + acc;
    }, '') + (p[1] === undefined ? '' : (',' + p[1]));
  }
})

;
