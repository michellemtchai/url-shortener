// setup express
const express = require('express');
const router = express.Router();

// setup dns
const dns = require('dns');

// setup bodyParser
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
  extended: false,
}));

// setup mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}); 
var autoIncrement = require('mongoose-sequence')(mongoose);
const {Schema, model} = mongoose;

// setup schema and model
const urlSchema = new Schema({
  _id: Number,
  url: { 
    type: String, 
    required: true
  }
}, { _id: false });
urlSchema.plugin(autoIncrement);
const Url = model('Url', urlSchema);

// create db functions
const createAndSaveURL = (url, done)=>{
  let link = new Url({url: url});
  link.save((err, data)=>done(err, data));
}
const findOneById = function(id, done) {
  Url.findById(id, (err, data)=>done(err, data))
};

const timeout = 10000;
const timeoutFn = (next)=>{
  return setTimeout(() => { 
    next({
      message: 'timeout'
    }) 
  }, timeout);
}
const getUrlFromDB = (id, req, res, next)=>{
  let t = timeoutFn(next);
  findOneById(id, (err, data)=>{
    clearTimeout(t);
    if(err === null && data === null){
      return next({message: `No shortened url with id=${id}`})
    }
    if(err) { 
      return (next(err)); 
    }
    if(!data) {
      console.log('Missing `done()` argument');
      return next({message: 'Missing callback argument'});
    } 
    else {
      res.redirect(data.url);
    }
  });
}
const saveUrlToDB = (url, req, res, next)=>{
  let t = timeoutFn(next);
  createAndSaveURL(url, (err, data)=>{
    clearTimeout(t);
    if(err) { 
      return (next(err)); 
    }
    if(!data) {
      console.log('Missing `done()` argument');
      return next({message: 'Missing callback argument'});
    } 
    else {
      res.json({
        original_url: data.url,
        short_url: data._id
      });
    }
  });
}

const errorMessage = (res, err)=>{
  res.json({ 
    error: err.message
  });
}

// routes
router.get('/shorturl/:id', (req, res)=>{
  let shortId = req.params.id;
  let renderError = (err)=>errorMessage(res, err);
  getUrlFromDB(shortId, req, res, renderError);
});

router.post('/shorturl/new', (req, res)=>{
  let link = req.body.url;
  let parts = link.split('/');
  let host = parts.length >=3 ? parts[2] : '';
  let renderError = (err)=>errorMessage(res, err);
  let invalidUrl = ()=>renderError({
    message: 'invalid url'
  });
  if(host && host.length > 0){
    dns.lookup(host, (err, address, family)=>{
      if(err){
        invalidUrl();
      }
      else{
        saveUrlToDB(link, req, res, renderError);
      }
    });
  }
  else{
    invalidUrl();
  }
 });
//---------- DO NOT EDIT BELOW THIS LINE --------------------

module.exports = router;
