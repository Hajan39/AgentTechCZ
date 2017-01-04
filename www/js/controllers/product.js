angular.module('cockpit.controllers')

.controller('ProductHomeCtrl', function($scope, $state, PRODUCTS) {
  $scope.productCategories = Object.keys(PRODUCTS.categories).map(function (key) {
    return {
      name: key,
      products: PRODUCTS.categories[key]
    };
  });

  $scope.toggleProductCategory = function(cat) {
    if ($scope.isProductCategoryShown(cat)) {
      $scope.shownProductCategory = null;
    } else {
      $scope.shownProductCategory = cat;
    }
  };
  $scope.isProductCategoryShown = function(cat) {
    return $scope.shownProductCategory === cat;
  };

  $scope.showProductTable = function(prod) {
    $state.go('tab.table', {
      key: prod.key
    });
  };

  $scope.goToIssue = function() {
    $state.go('tab.issue');
  };

  $scope.goToRepay = function() {
    $state.go('tab.repay');
  };
})

.controller('ProductIssueCtrl', function($scope, $state, PRODUCTS) {
  $scope.issueValue = 20000;
  $scope.issueRanger = {
    issue: function (val) {
      return arguments.length ? ($scope.issueValue = parseInt(val)) : $scope.issueValue;
    }
  };

  $scope.changeIssueValue = function() {

    $scope.productCategories = Object.keys(PRODUCTS.categories).map(function(catKey) {
      var category = PRODUCTS.categories[catKey];
      var ret = {
        name: catKey,
        products: []
      };

      var categoryChosenInfo = null, categoryChosenProduct = null, categoryMaximumInfo = null, categoryMaximumProduct = null;
      $.each(category, function(productIndex, product) {
        var key = product.key;
        ret.termType = product.termType;
        var productRet = {
          name: product.name,
          term: product.term,
          termType: product.termType,
          key: key
        };

        var productChosenInfo = null, productMaximumInfo = null;
        $.each(PRODUCTS.infos[key], function(infoKey, productInfo) {
          var keyValue = function(val) { return val;};

          if (keyValue(productInfo.totalAmountOfLoan) >= $scope.issueValue) {
            if (categoryChosenInfo == null) {
              categoryChosenInfo = productInfo;
              categoryChosenProduct = product;
            }
            if (categoryChosenInfo.totalAmountOfLoan > productInfo.totalAmountOfLoan) {
              categoryChosenInfo = productInfo;
              categoryChosenProduct = product;
            } else if (categoryChosenInfo.totalAmountOfLoan == productInfo.totalAmountOfLoan && categoryChosenInfo.weeklyInstallment > productInfo.weeklyInstallment) {
              categoryChosenInfo = productInfo;
              categoryChosenProduct = product;
            }
          }
          if (categoryMaximumInfo == null) {
            categoryMaximumInfo = productInfo;
            categoryMaximumProduct = product;
          } else if (categoryMaximumInfo.totalAmountOfLoan < productInfo.totalAmountOfLoan) {
            categoryMaximumInfo = productInfo;
            categoryMaximumProduct = product;
          } else if (categoryMaximumInfo.totalAmountOfLoan == productInfo.totalAmountOfLoan && categoryMaximumInfo.weeklyInstallment < productInfo.weeklyInstallment) {
            categoryMaximumInfo = productInfo;
            categoryMaximumProduct = product;
          }

          if (keyValue(productInfo.totalAmountOfLoan) >= $scope.issueValue) {
            if (productChosenInfo == null) {
              productChosenInfo = productInfo;
            }
            if (productChosenInfo.totalAmountOfLoan > productInfo.totalAmountOfLoan) {
              productChosenInfo = productInfo;
            } else if (productChosenInfo.totalAmountOfLoan == productInfo.totalAmountOfLoan && productChosenInfo.weeklyInstallment > productInfo.weeklyInstallment) {
              productChosenInfo = productInfo;
            }
          }
          if (productMaximumInfo == null) {
            productMaximumInfo = productInfo;
          } else if (productMaximumInfo.totalAmountOfLoan < productInfo.totalAmountOfLoan) {
            productMaximumInfo = productInfo;
          } else if (productMaximumInfo.totalAmountOfLoan == productInfo.totalAmountOfLoan && productMaximumInfo.weeklyInstallment < productInfo.weeklyInstallment) {
            productMaximumInfo = productInfo;
          }
        });

        if (productChosenInfo == null) productChosenInfo = productMaximumInfo;

        productRet.issue = productChosenInfo.totalAmountOfLoan;
        productRet.cleanRepay = productChosenInfo.weeklyInstallment;

        ret.products.push(productRet);
      });
      if (categoryChosenInfo == null) {
        categoryChosenInfo = categoryMaximumInfo;
        categoryChosenProduct = categoryMaximumProduct;
      }

      ret.issue = categoryChosenInfo.totalAmountOfLoan;
      ret.cleanRepay = categoryChosenInfo.weeklyInstallment;
      ret.termType = categoryChosenProduct.termType;
      return ret;
    });
  };
  $scope.changeIssueValue();

  $scope.toggleProductCategory = function(cat) {
    if ($scope.isProductCategoryShown(cat)) {
      $scope.shownProductCategory = null;
    } else {
      $scope.shownProductCategory = cat.name;
    }
  };
  $scope.isProductCategoryShown = function(cat) {
    return $scope.shownProductCategory !== null && $scope.shownProductCategory === cat.name;
  };
  $scope.shownProductCategory = null;

  $scope.showProduct = function(prod) {
    $state.go('tab.sli', {
      key: prod.key,
      issue: prod.issue
    });
  };

  $scope.goToHome = function() {
    $state.go('tab.product');
  };

  $scope.goToRepay = function() {
    $state.go('tab.repay');
  };
})

.controller('ProductRepayCtrl', function($scope, $state, PRODUCTS) {
  $scope.issueValue = 1650;
  $scope.issueRanger = {
    issue: function (val) {
      return arguments.length ? ($scope.issueValue = parseInt(val)) : $scope.issueValue;
    }
  };

  $scope.changeIssueValue = function() {
    $scope.productCategories = Object.keys(PRODUCTS.categories).map(function(catKey) {
      var category = PRODUCTS.categories[catKey];
      var ret = {
        name: catKey,
        products: []
      };

      var categoryChosenInfo = null, categoryChosenProduct = null;
      $.each(category, function(productIndex, product) {
        var key = product.key;
        ret.termType = product.termType;
        var productRet = {
          name: product.name,
          term: product.term,
          termType: product.termType,
          key: key
        };

        var productChosenInfo = null;
        $.each(PRODUCTS.infos[key], function(infoKey, productInfo) {
          var keyValue = function(val) { return val;};
          if (product.termType == 'WE') {
            keyValue = function(val) { return val * 4; };
          }

          if (categoryChosenInfo === null) {
            categoryChosenInfo = productInfo;
            categoryChosenProduct = product;
          } else {
            if (keyValue(productInfo.weeklyInstallment) <= $scope.issueValue) {
              if (keyValue(categoryChosenInfo.weeklyInstallment) <= keyValue(productInfo.weeklyInstallment)) {
                categoryChosenInfo = productInfo;
                categoryChosenProduct = product;
              }
            } else {
              if (keyValue(categoryChosenInfo.weeklyInstallment) > keyValue(productInfo.weeklyInstallment)) {
                categoryChosenInfo = productInfo;
                categoryChosenProduct = product;
              }
            }
          }

            if (productChosenInfo === null) {
              productChosenInfo = productInfo;
            } else {
              if (keyValue(productInfo.weeklyInstallment) <= $scope.issueValue) {
                if (keyValue(productChosenInfo.weeklyInstallment) <= keyValue(productInfo.weeklyInstallment)) {
                  productChosenInfo = productInfo;
                }
              } else {
                if (keyValue(productChosenInfo.weeklyInstallment) > keyValue(productInfo.weeklyInstallment)) {
                  productChosenInfo = productInfo;
                }
              }
            }
        });

        productRet.issue = productChosenInfo.totalAmountOfLoan;
        productRet.repay = (product.termType == 'WE' ? 4 : 1) * productChosenInfo.weeklyInstallment;
        productRet.cleanRepay = productChosenInfo.weeklyInstallment;

        ret.products.push(productRet);
      });

      ret.issue = categoryChosenInfo.totalAmountOfLoan;
      ret.repay = (categoryChosenProduct.termType == 'WE' ? 4 : 1) * categoryChosenInfo.weeklyInstallment;
      ret.cleanRepay = categoryChosenInfo.weeklyInstallment;
      ret.termType = categoryChosenProduct.termType;
      return ret;
    });
  };
  $scope.changeIssueValue();
  console.log($scope.productCategories);

  $scope.toggleProductCategory = function(cat) {
    if ($scope.isProductCategoryShown(cat)) {
      $scope.shownProductCategory = null;
    } else {
      $scope.shownProductCategory = cat.name;
    }
  };
  $scope.isProductCategoryShown = function(cat) {
    return $scope.shownProductCategory !== null && $scope.shownProductCategory === cat.name;
  };
  $scope.shownProductCategory = null;

  $scope.showProduct = function(prod) {
    $state.go('tab.sli', {
      key: prod.key,
      issue: prod.issue
    });
  };

  $scope.goToHome = function() {
    $state.go('tab.product');
  };

  $scope.goToIssue = function() {
    $state.go('tab.issue');
  };
})

.controller('ProductTableCtrl', function($scope, $state, $stateParams, PRODUCTS) {
  var key = $stateParams.key;

  $.each(PRODUCTS.categories, function() {
    $.each(this, function() {
      if (this.key === key) {
        $scope.productCategory = this.name;
        $scope.productTerm = this.term + (this.termType == 'MO' ? ' měsíců' : ' týdnů');
        $scope.productRepayment = this.termType == 'MO' ? 'měsíčně' : 'týdně';
      }
    });
  });

  $scope.table = [];
  $.each(PRODUCTS.infos[key], function () {
    $scope.table.push({
      issueValue: this.totalAmountOfLoan,
      instalment: this.weeklyInstallment
    });
  });

  $scope.issue = function(issueValue) {
    $state.go('tab.sli', {
      key: key,
      issue: issueValue
    });
  };
})

.controller('ProductSilCtrl', function($scope, $state, $stateParams, PRODUCTS) {
  var key = $stateParams.key;
  var issue = $stateParams.issue;
  $.each(PRODUCTS.infos[key], function () {
    if (this.totalAmountOfLoan == issue) {
      $scope.d = this;
    }
  });

  $scope.continue = function() {
    $state.go('tab.ag', {
      key: key,
      issue: issue
    });
  };

  $.each(PRODUCTS.categories, function() {
    $.each(this, function() {
      if (this.key === key) {
        $scope.instalmentDescription = this.termType == 'MO' ? 'měsíční' : 'týdenní';
        $scope.instalmentDescription3 = this.termType == 'MO' ? 'měsíců' : 'týdnů';
        if (key.substring(0, 2) == 'HC') {
          $scope.handlingDescription = ', doručení a flexibilní splácení';
          $scope.adminDescription = 'administrativní činnost a komfortní splácení';
        } else {
          if (key.substring(0, 3) == 'MT+') {
            $scope.handlingDescription = '';
            $scope.adminDescription = 'administrativní činnost';
          } else {
            $scope.handlingDescription = ' a flexibilní splácení';
            $scope.adminDescription = 'administrativní činnost';
          }
        }
      }
    });
  });
})

.controller('ProductAgCtrl', function($scope, $state, $stateParams, PRODUCTS) {
  var key = $stateParams.key;
  var issue = $stateParams.issue;
  $.each(PRODUCTS.infos[key], function () {
    if (this.totalAmountOfLoan == issue) {
      $scope.d = this;
    }
  });

  $.each(PRODUCTS.categories, function() {
    $.each(this, function() {
      if (this.key === key) {
        $scope.instalmentDescription = this.termType == 'MO' ? 'měsíční' : 'týdenní';
        $scope.instalmentDescription2 = this.termType == 'MO' ? 'měsíčních' : 'týdenních';
        if (key.substring(0, 2) == 'HC') {
          $scope.handlingDescription = ', doručení a flexibilní splácení';
          $scope.adminDescription = 'administrativní činnost a komfortní splácení';
        } else {
          if (key.substring(0, 3) == 'MT+') {
            $scope.handlingDescription = '';
            $scope.adminDescription = 'administrativní činnost';
          } else {
            $scope.handlingDescription = ' a flexibilní splácení';
            $scope.adminDescription = 'administrativní činnost';
          }
        }
      }
    });
  });
})

;
