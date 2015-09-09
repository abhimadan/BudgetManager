var express = require('express');
var router = express.Router();

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("transactions.db");

db.serialize(function() {
  var columns = "transactionId INTEGER PRIMARY KEY, date TEXT DEFAULT CURRENT_DATE, classification INTEGER, type TEXT, amount REAL, description TEXT";
  db.run("CREATE TABLE IF NOT EXISTS Transactions (" + columns + ")");
});

// transactionId, classification (income or expense), type (food, groceries, etc.), amount, description, date

// get rid of the db stuff in the routes, they're just for testing
// the home page will also need to be redesigned to work with the app

/* GET home page. */
router.get('/', function(req, res, next) {
  db.run("INSERT INTO Transactions (amount, description) VALUES (?, ?)", 1.55, "testing stuff");
  
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
  db.all("SELECT * FROM Transactions", function(err, rows) {
    if (err != null)
    {
      res.send(err);
      return;
    }
    
    res.send({ amount: "$" +  rows[1].amount.toString() , description: rows[1].description });
  });
});

module.exports = router;
