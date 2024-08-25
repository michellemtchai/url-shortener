'use strict';

var express = require('express');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var routes = require('./routes');
app.use('/api', routes);
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


// bGround.setupBackgroundApp(app, myApp, __dirname).listen(port, function(){
//   bGround.log('Node is listening on port '+ port + '...')
// });

// require('./routes')(app); // pass our application into our routes

const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
