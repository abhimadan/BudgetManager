// the client needs to clear the add transaction screen so that duplicate transactions aren't added
// maybe have a text file or another database table to store different expense types
// this feature would require some more REST routes related to adding, deleting, and getting the different types

var fs = require('fs');

var express = require('express');
var router = express.Router();

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("transactions.db");

db.serialize(function() {
  var columns = "transactionId INTEGER PRIMARY KEY, date TEXT DEFAULT CURRENT_DATE, classification INTEGER, type TEXT, amount REAL, description TEXT";
  db.run("CREATE TABLE IF NOT EXISTS Transactions (" + columns + ")");
});

// transactionId, classification (income or expense), type (food, groceries, etc.), amount, description, date

// the home page will also need to be redesigned to work with the app

// another feature to add is to produce income statements for the month and year
// there should be enough routes defined already to do this on the client side
// maybe consider adding routes to calculate total income and expenses here

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Budget Manager' });
});

/* Get a list of transactions for the given day. */
router.get('/transactions/:year/:month/:day', function(req, res, next) {
  if (isNaN(req.params.year) || isNaN(req.params.month) || isNaN(req.params.day)) //parameters must be numbers
  {
    console.log("The year " + req.params.year + " or the month " + req.params.month + " or the day " + req.params.day + " is not a number.");
    res.status(404).end();
    return;
  }
  
  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);
  var day = parseInt(req.params.day);

  if (month < 1 || month > 12 || year < 1) //invalid year or month
  {
    console.log("The year " + year + " or the month " + month + " is invalid.");
    res.status(404).end();
    return;
  }
  
  var dateString = new Date(year, month - 1, day).toJSON().substr(0, 10);

  console.log(dateString);
  
  if (isNaN(Date.parse(dateString)))
  {
    console.log("The date " + dateString + " is invalid.");
    res.status(404).end();
    return;
  }

  db.all("SELECT * FROM Transactions WHERE date = ?", dateString, function(err, rows) {
    if (err != undefined || rows == null)
    {
      console.log("Error: " + err);  
      res.status(404).end(); 
      return;
    }
    res.json(rows); 
  });
});

/* Get a list of transactions for the given month. */
router.get('/transactions/:year/:month', function(req, res, next) {
  if (isNaN(req.params.year) || isNaN(req.params.month)) //parameters must be numbers
  {
    console.log("The year " + req.params.year + " or the month " + req.params.month + " is not a number.");
    res.status(404).end();
    return;
  }
  
  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);

  if (month < 1 || month > 12 || year < 1) //invalid year or month
  {
    console.log("The year " + year + " or the month " + month + " is invalid.");
    res.status(404).end();
    return;
  }

  var daysInMonth = new Date(year, month, 0).getDate();
  var begMonth = new Date(year, month - 1, 1).toJSON().substr(0, 10);
  var endMonth = new Date(year, month - 1, daysInMonth).toJSON().substr(0, 10);

  db.all("SELECT * FROM Transactions WHERE date BETWEEN ? AND ?", begMonth, endMonth, function(err, rows) {
    if (err != undefined || rows == null)
    {
      console.log("Error: " + err);
      res.status(404).end(); 
      return;
    }
    res.json(rows); 
  });
});

/* Get a list of transactions for the given year. */
router.get('/transactions/:year', function(req, res, next) {
  if (isNaN(req.params.year)) //parameters must be numbers
  {
    console.log("The year " + req.params.year + " is not a number.");
    res.status(404).end();
    return;
  }
  
  var year = parseInt(req.params.year);

  if (year < 1) //invalid year
  {
    console.log("The year " + year + " is invalid.");
    res.status(404).end();
    return;
  }

  var begYear = new Date(year, 0, 1).toJSON().substr(0, 10);
  var endYear = new Date(year, 11, 31).toJSON().substr(0, 10);

  db.all("SELECT * FROM Transactions WHERE date BETWEEN ? AND ?", begYear, endYear, function(err, rows) {
    if (err != undefined || rows == null)
    {
      console.log("Error: " + err);
      res.status(404).end(); 
      return;
    }
    res.json(rows); 
  });   
});

/* Add a new transaction to the database. */
router.post('/transactions', function(req, res, next) {
  var done = function(err) {
    if (err) {
      console.log(err);
      res.json({ id: -1 });
      return;
    }

    res.json({ id: this.lastID });
  }

  //maybe add checks for all the properties in req.body here
  var properties = "classification, type, amount, description";
  var numProperties = 4;

  if (req.body.hasOwnProperty("date"))
  {
    properties = "date, " + properties; 
    numProperties++;
  }
  
  if (numProperties == 4)
  {
    db.run("INSERT INTO Transactions (" + properties + ") VALUES (?, ?, ?, ?)", req.body.classification, req.body.type, req.body.amount, req.body.description, done); 
  }
  else if (numProperties == 5) //checking numProperties here is for clarity rather than necessity
  {
    db.run("INSERT INTO Transactions (" + properties + ") VALUES (?, ?, ?, ?, ?)", req.body.date, req.body.classification, req.body.type, req.body.amount, req.body.description, done); 
  }
});

/* Updates an existing transaction's data. */
router.put('/transactions/:id', function(req, res, next) {
  //check if id is an int
  //query for transaction, update fields with req properties
  //need to first check if all the properties are there, and parse
  //them as required
  
  //the checks mentioned above are not here right now, but they may be added later
  //it's possible that they're not necessary, since these routes are accessed
  //through a web client

  var id = parseInt(req.params.id);
  
  db.run("UPDATE Transactions SET date = ?, classification = ?, type = ?, amount = ?, description = ? WHERE transactionId = ?", req.body.date, req.body.classification, req.body.type, req.body.amount, req.body.description, id);

  res.json({ updatedId: id });
});

/* Deletes an existing transaction. */
router.delete('/transactions/:id', function(req, res, next) {
  var id = parseInt(req.params.id);

  db.run("DELETE FROM Transactions WHERE transactionId = ?", id);

  res.json({ deletedId: id });
});

/* Adds an expense or income type to the list. */
router.post('/types/:classification', function(req, res, next) {
  var classification = parseInt(req.params.classification);
  var typesList = {
    expenses: [],
    income: []
  };

  if (fs.existsSync("types.json"))
  {
    //load json from file
    typesList = JSON.parse(fs.readFileSync("types.json", "utf8"));
  }
  
  var property = classification == 0 ? "expenses" : "income";

  if (typesList[property].indexOf(req.body.type) < 0)
  {
    typesList[property].push(req.body.type);
    res.json({ status: "added" });
  }
  else
  {
    res.json({ status: "exists" });
  }

  fs.writeFileSync("types.json", JSON.stringify(typesList));
});

/* Gets the stored list of income and expense types. */
router.get('/types', function(req, res, next) {
  var typesList = {
    expenses: [],
    income: []
  };

  if (fs.existsSync("types.json"))
  {
    //load json from file
    typesList = JSON.parse(fs.readFileSync("types.json", "utf8"));
  } 

  res.json(typesList);
});

/* Gets the stored list of income or expense types. */
router.get('/types/:classification', function(req, res, next) {
  var classification = parseInt(req.params.classification);
  var property = classification == 0 ? "expenses" : "income"; 

  var classList = [];

  if (fs.existsSync("types.json"))
  {
    //load json from file and store only the required type
    classList = JSON.parse(fs.readFileSync("types.json", "utf8"))[property];
  }

  res.json(classList);
});

/* Deletes the given type from the given classification list. */
router.delete('/types/:classification/:type', function(req, res, next) {
  var typesList = {
    expenses: [],
    income: []
  };

  if (fs.existsSync("types.json"))
  {
    //load json from file
    typesList = JSON.parse(fs.readFileSync("types.json", "utf8"));
  }

  var classification = parseInt(req.params.classification);
  var property = classification == 0 ? "expenses" : "income"; 

  var type = req.params.type;

  var index = typesList[property].indexOf(type);

  if (index < 0)
  {
    res.json({ status: "not in list" });
  }
  else
  {
    typesList[property].splice(index, 1);

    res.json({ status: "deleted" });
  }
});

module.exports = router;
