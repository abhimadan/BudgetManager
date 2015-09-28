var app = angular.module('budgetManager', []);

app.factory('transactions', [function() {
  var transactions = {
    list: [],

    create: function() {
      var transaction = {
        date: new Date(),
        classification: 0,
        type: "",
        amount: 0.00,
        description: ""
      };

      return transaction;
    }
  };

  return transactions;
}]);

app.controller('MainCtrl', ['$scope', '$http', 'transactions', function($scope, $http, transactions) {
  //might need two separate controllers:
  //one for new transactions, one for history
  //they'll use the same transaction service though

  $scope.history = transactions.list;
  
  $scope.transaction = transactions.create();

  $scope.addTransaction = function() {
    console.log($scope.transaction);

    $http.post('/transactions', {
      date: $scope.transaction.date.toJSON().substr(0, 10),
      classification: parseInt($scope.transaction.classification),
      type: $scope.transaction.type,
      amount: $scope.transaction.amount,
      description: $scope.transaction.description
    });
  }
}]);
