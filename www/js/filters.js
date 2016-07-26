angular.module('starter')


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

;
