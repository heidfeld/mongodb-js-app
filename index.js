const url = 'mongodb://localhost:27017/';
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/cities', function(req, res) {

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tzt");
    dbo.collection("city").find({}).toArray(function(err, result) {
      if (err) throw err;

      var html_content = '<h2>Wszystkie Miasta</h2><ul>';
      for (var i = 0 ; i < result.length ; i++) {
        html_content += '<li>';
        html_content += result[i].city;
        html_content += '</li>';
      }
      html_content += '</ul>';
      db.close();
      res.send(html_content);
    });
  });
});

app.get('/person', function(req, res) {
  var personId = req.query.id;
  var html_content = `<h2>Osoba z id: ${personId}</h2>`;

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tzt");
    var query = { _id: parseInt(personId) };
    dbo.collection("person").find(query).toArray(function(err, result) {
      if (err) throw err;
      if(result.length > 0) {
        html_content += JSON.stringify(result[0]);
      }
      db.close();
      res.send(html_content);
    });
  });
});

app.get('/addCity', function(req, res) {
  var cityId = req.query.id;
  var html_content = `<h2>Dodano nowe miasto z id: ${cityId}</h2>`;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tzt");
    var myobj = {
      _id: parseInt(req.query.id),
      index: parseInt(req.query.id),
      city: req.query.city,
      country: req.query.country,
      population: parseInt(req.query.population),
      area: parseInt(req.query.area)
    };
    dbo.collection("city").insertOne(myobj, function(err, response) {
      if (err) throw err;
      db.close();
      res.send(html_content);
    });
  });
});

app.post('/updatePerson', function(req, res) {
  var personId = req.body.id;
  var html_content = `<h2>Zaktualizowano osobę z id: ${personId}</h2>`;

  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("tzt");
  var myquery = { _id: parseInt(personId) };
  var newvalues = { $set: {
    name: req.body.name,
    surname: req.body.surname,
    city: parseInt(req.body.city)
  }};
  dbo.collection("person").updateOne(myquery, newvalues, function(err, response) {
    if (err) throw err;
    db.close();
    res.send(html_content);
  });
});


});

app.get('/main', function(req, res) {
	res.send(`
  <h2>Dodaj Miasto</h2>
	<form method="GET" action="/addCity">
    Id:<br><input type="text" name="id"><br>
    Nazwa Miasta:<br><input type="text" name="city"><br>
    Kraj:<br><input type="text" name="country"><br>
    Liczba Mieszkańców:<br><input type="text" name="population"><br>
    Powierzchnia:<br><input type="text" name="area"><br>
    <input type="submit" value="Dodaj Miasto">
  </form>
  <br>
  <h2>Zaktualizuj Osobę</h2>
  <form method="POST" action="/updatePerson">
    Id:<br><input type="text" name="id"><br>
    Imię:<br><input type="text" name="name"><br>
    Nazwisko:<br><input type="text" name="surname"><br>
    Miasto:<br><input type="text" name="city"><br>
    <input type="submit" value="Zaktualizuj">
  </form><br>
  <h2>Wszystkie Miasta</h2>
  <form method="GET" action="/cities">
    <input type="submit" value="Pokaż">
  </form><br>
  <h2>Wypisz Osobę</h2>
  <form method="GET" action="/person">
    Id:<br><input type="text" name="id"><br>
    <input type="submit" value="Pokaż">
  </form><br><br>
  `)
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
