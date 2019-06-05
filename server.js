// server.js
// where your node app starts
const Twit = require('twit')
const Markov = require("markov-strings").default;

const t = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const {getTweetText} = require('./tweets')
const {
  sanitize,
  sanitizeGenerated,
  isTextEndAtSentinel,
  isUnder280Char
} = require('./text')
// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

async function search(maxId, tweets = []) {
   const {data: {statuses}} = await t.get('search/tweets', {
    q: 'eid hari raya',
    tweet_mode: "extended",
    count: 200,
    max_id: maxId
  })
  const result = [...tweets, ...statuses.slice(1)]
  const maxIdStr = result.map(t => t.id_str).sort()[0]
  console.log(result.length, maxIdStr)
  if ( result.length >= 2500 || statuses.length === 1) {
    return {
      statuses: result,
      maxId: maxIdStr
    }
  } else {
    return search(maxIdStr, result)
  }
   
}

function saveTweets(statuses, maxId) {
  var stmt = db.prepare("INSERT INTO Texts (str) VALUES (?)");
  for (var i = 0; i < statuses.length; i++) {
      stmt.run(sanitize(getTweetText(statuses[i])))
  }
  stmt.finalize();
  
  var stmt2 = db.prepare("INSERT INTO Max (max) VALUES (?)");
  stmt2.run(maxId)
  stmt2.finalize()
}

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Texts (str TEXT)');
    db.run('CREATE TABLE Max (max TEXT)');
    console.log('New table Texts created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO Texts (str) VALUES ("Happy Eid Mubarak!")');
    });
  }
  else {
    // db.run('CREATE TABLE Max (max TEXT)');
    
    // db.run('CREATE TABLE Texts (str TEXT)');
    // db.run('CREATE TABLE Max (max TEXT)');
    // db.run('DROP TABLE Texts');
    // db.run('DROP TABLE Max');
    console.log('Database "Texts" ready to go!');
    
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/generated', function(request, response) {
  db.all('SELECT * from Texts', function(err, rows) {
    const texts = rows.map(row => row.str)
      const markov = new Markov(texts, { stateSize: 2 });
    markov.buildCorpus();
  const options = {
  maxTries: 1000, // Give up if I don't have a sentence after 20 tries (default is 10)
  filter: result => {
    return (
      result.score > 100 &&
      result.string.split(" ").length >= 5 &&
      isTextEndAtSentinel(result.string) &&
      isUnder280Char(result.string)
    );
  }
};
    const result = markov.generate(options);
    console.log(result)
  response.send({data: sanitizeGenerated(result.string)})

  });
})

app.get('/texts', function(request, response) {
  db.all('SELECT * from Texts', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.post('/textEntries', async function(request, response) { 
  
  const initialMaxId = await new Promise(resolve => {
    let mid = '0'
    db.all('SELECT * from Max', function(err, rows) {
      console.log({rows})
      if (rows) {
        mid = rows.map(row => row.max).sort()[0]
      }
      resolve(mid)
    });
  })
  console.log('Initial Max ID', initialMaxId)
  const {statuses, maxId} = await search(initialMaxId)
  saveTweets(statuses, maxId)
  
  response.send({length: statuses.length, maxId})
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
