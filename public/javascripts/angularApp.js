var app = angular.module('budgetManager', []);

app.factory('transactions', ['$http', function($http) {
  var transactions = {
    create: function() {
      var transaction = {
        date: new Date(),
        classification: 0,
        type: "",
        amount: 0.00,
        description: ""
      };

      return transaction;
    },

    addTransaction: function(transaction) {
      console.log(transaction.date.toJSON());

      $http.post('/transactions', {
        date: transaction.date.toJSON().substr(0, 10),
        classification: parseInt(transaction.classification),
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description
      });
    },
    
    queryTransactions: function(query, date, results) {
      switch (query) {
        case 0:
          $http.get('/transactions/' + date.getFullYear())
            .then(function(res) {
              results.splice(0, results.length);
              res.data.forEach(function(result) { result.date = new Date(result.date); results.push(result); });
            });
          break;
        case 1:
          $http.get('/transactions/' + date.getFullYear() + '/' + (date.getMonth() + 1))
            .then(function (res) {
              results.splice(0, results.length);
              res.data.forEach(function(result) { result.date = new Date(result.date); results.push(result); });
            });
          break;
        case 2:
          $http.get('/transactions/' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate())
            .then(function (res) {
              results.splice(0, results.length);
              res.data.forEach(function(result) { result.date = new Date(result.date); results.push(result); });
            });
          break;
        default:
          // should never be hit
          break;
      }
    }
  };

  return transactions;
}]);

app.controller('AddCtrl', ['$scope', 'transactions', function($scope, transactions) {
  $scope.transaction = transactions.create();
  
  $scope.added = false;

  $scope.addTransaction = function() {
    transactions.addTransaction($scope.transaction)
    $scope.transaction = transactions.create();
    $scope.added = true;
  }
}]);

app.controller('HistCtrl', ['$scope', 'transactions', function($scope, transactions) {
  $scope.queryType = 2;
  $scope.query = new Date();
  $scope.queryResults = [];

  $scope.queryTransactions = function() {
    console.log($scope.queryType, $scope.query);
    transactions.queryTransactions(parseInt($scope.queryType), $scope.query, $scope.queryResults);
  }
}]);
