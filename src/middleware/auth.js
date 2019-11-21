const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const User = require('../models/user');

function auth(req, res, next) {
  let token = null
  if(req.header('Authorization')) {
    token = req.header('Authorization').replace('Bearer ', '');
  }else {
    token = req.cookies['authToken'];
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  User.findOne({_id: decode._id, 'tokens.token': token}, (error, user) => {
    if(error) {
      return res.status(400).send(error.message)
    }
    req.user = user;
    req.token = token; 
    next();
  })
  
}

module.exports = auth;