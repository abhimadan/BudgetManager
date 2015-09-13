// the client needs to clear the add transaction screen
// also the POST /transactions function needs to return at least the index of the new column
// maybe have a text file or another database table to store different expense types

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

// routes to add:
// query for transactions within a range of days (return json array)
// 	maybe also query by classification?
// add a new transaction [x]
// update a transaction 
// delete a transaction 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Get a list of transactions for the given day. */
router.get('/transactions/:date', function(req, res, next) {
  //query database for given day (yyyy-mm-dd), return as array
  db.all("SELECT * FROM Transactions WHERE date = ?", req.params.date, function(err, rows) {
    if (err != undefined || rows == null)
    {
      res.status(404).end(); 
    }
    res.json(rows); 
  });
});

/* Add a new transaction to the database. */
router.post('/transactions', function(req, res, next) {
  //console.log(req.body);
  var properties = "classification, type, amount, description";
  var numProperties = 4;

  if (req.body.hasOwnProperty("date"))
  {
    properties = "date, " + properties; 
    numProperties++;
  }
  
  if (numProperties == 4)
  {
    db.run("INSERT INTO Transactions (" + properties + ") VALUES (?, ?, ?, ?)", req.body.classification, req.body.type, req.body.amount, req.body.description); 
  }
  else if (numProperties == 5) //check is for clarity rather than necessity
  {
    db.run("INSERT INTO Transactions (" + properties + ") VALUES (?, ?, ?, ?, ?)", req.body.date, req.body.classification, req.body.type, req.body.amount, req.body.description); 
  }

  //get id of newly created db entry
  res.end();
});

module.exports = router;
