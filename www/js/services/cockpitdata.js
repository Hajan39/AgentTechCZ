angular.module('cockpit.services')

//.factory('UserData', function ($localstorage, $state, $ionicPopup, $cordovaGoogleAnalytics, $cordovaLocalNotification) {
.factory('CockpitData', function ($q, UserData) {
  var data = {};

  var getData = function(url, storageKey) {
    return $q(function (resolve, reject) {
      if (storageKey !== undefined && data[storageKey] !== undefined) {
        resolve(data[storageKey]);
        return;
      }

      UserData.get(url, storageKey).then(function (result) {
        data[storageKey] = result;
        resolve(result);
      }).catch(function (error) {
        reject(error);
      })
    });
  }

  var that = {
    getUser: function() {
      return getData('', 'user').then(function (result) {
        if (result.code != 'OK') {
          return null;
        }

        var position = result.data.position;
        position.role = position.positionCode === 4 ? "BR" : "AG";

        return {
          position: position,
          subs: result.data.subs
        };
      }).catch(function() {
        return null;
      });
    },

    getReports: function() {
      return getData('reports', 'reports').then(function (result) {
        var reports = result.data.plan;
        return {
          plans: [
            {paramName: 'NC', value: reports.nc.value},
            {paramName: 'OBN', value: reports.obn.value},
            {paramName: 'SUB', value: reports.sub.value},
            {paramName: 'REF', value: reports.ref.value},
            {paramName: 'PU', value: reports.pu.value},
            {paramName: 'Prodeje', value: reports.sales.value},
            {paramName: 'Výběry', value: reports.collections.value},
            {paramName: 'VZ', value: reports.vz.value},
            {paramName: '5+', value: `${reports.c5Plus.value}/${reports.c5PlusTotal.value}`},
            {paramName: '5=', value: `${reports.c5.value}/${reports.c5Total.value}`},
            {paramName: '8=', value: `${reports.c8.value}/${reports.c8Total.value}`},
            {paramName: '12+', value: `${reports.c12Plus.value}/${reports.c12PlusTotal.value}`},
            {paramName: 'RIA', value: `${reports.ria.value}/${reports.riaTotal.value}`},
            {paramName: 'NRIA', value: `${reports.nria.value}/${reports.nriaTotal.value}`},
            {paramName: 'QC', value: `${reports.qc.value}/${reports.qcTotal.value}`},
            {paramName: 'BTQ', value: `${reports.btq.value}/${reports.btqTotal.value}`},
            {paramName: '12', value: `${reports.c12St.value}/${reports.c12StTotal.value}`},
            {paramName: 'Predikce', value: `NC - ${reports.ncPred.value}, Prodeje - ${reports.salPred.value}, Výběry - ${reports.collPred.value}`},
          ],
          fulfillment: result.data.fulfillment
        };
      });
    },

    sendReports: function () {
      UserData.post('reports', {});
    },

    getParamReports: function(paramName) {
      getData('reports/' + paramName).then(function (result) {
        console.log(result);
      })
    },

    getStats: function () {
      return getData('stats', 'stats').then(function (result) {
        if (result.code != 'OK') {
          return {plans: [], month: null};
        }

        var coll = result.data.filter(function (row) {
          return row.desc != 'C1' && row.desc != 'C2' && row.desc != 'L1' && row.desc != 'L2';
        });

        return {
          plans: coll.map(function (e) {
              switch (e.desc) {
                case 'Coll': return {desc: 'Výběry', plan: e.plan, reality: e.reality};
                case 'Sales': return {desc: 'Prodeje', plan: e.plan, reality: e.reality};
                case 'Reserves': return {desc: 'RES', plan: e.plan, reality: e.reality};
                default: return e
              }
            }),
          month: coll[0] === undefined ? null : coll[0].thismonth
        };
      }).catch(function() {
        return {plans: [], month: null};
      });
    },

    getSubStats: function (id) {
      return getData('stats/' + id).then(function (result) {
        if (result.code != 'OK') {
          return {plans: [], month: null};
        }

        var coll = result.data.filter(function (row) {
          return row.desc != 'C1' && row.desc != 'C2' && row.desc != 'L1' && row.desc != 'L2';
        });

        return {
          plans: coll.map(function (e) {
              switch (e.desc) {
                case 'Coll': return {desc: 'Výběry', plan: e.plan, reality: e.reality};
                case 'Sales': return {desc: 'Prodeje', plan: e.plan, reality: e.reality};
                case 'Reserves': return {desc: 'RES', plan: e.plan, reality: e.reality};
                default: return e
              }
            }),
          month: coll[0] === undefined ? null : coll[0].thismonth
        };
      }).catch(function() {
        return {plans: [], month: null};
      });
    },

    getAgentCommission: function () {
      return getData('comm', 'comm').then(function (result) {
        if (result.code != 'OK') {
          return {weekId: 0};
        }

        return result.data;
      }).catch(function() {
        return {weekId: 0};
      });
    },

    getAgentCommissionDetail: function (weekId) {
      return UserData.get('comm/' + weekId).then(function (result) {
        if (result.code != 'OK') {
          return null;
        }

        return result.data;
      }).catch(function() {
        return null;
      });
    },

    refresh: function() {
      data = {};
      UserData.refresh();

      return $q(function (resolve) {
        that.getUser().then(function (userData) {
          that.getStats().then(function (statsData) {
            that.getAgentCommission().then(function (commData) {
              resolve({
                user: userData,
                stats: statsData,
                comm: commData
              });
            })
          });
        });
      });
    }
  };

  return that;
});
