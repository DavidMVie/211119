const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();



// Create New User 
router.post('/users', (req, res) => {

  const user = new User(req.body);

  user.getAuthToken((error, token) => {
    if(error) {
      return res.status(400).send(error.message)
    }
    user.save(function(error, user) {
      if(error) {
        return res.status(400).send(error.message);
      }
      res.cookie('authToken', token);
      res.status(201).send({user, token})
    })  
  })


})


// Sign A User Out
router.get('/users/logout', auth, async(req, res) => {
   req.user.tokens = req.user.tokens.filter((token) => {
     return token.token !== req.token
   })

   req.user.save((error, user) => {
     if(error) {
       return res.status(400).send(error.message);
     }
     res.send({msg: 'Logged Out', user})
   })
})

// Log User In 
router.post('/users/login', (req, res) => {
  User.findByCredentials(req.body.email, req.body.password, (error, user) => {
    if(error) { return res.status(400).send(error.message)}
    // get them a token
    user.getAuthToken((error, token) => {
      if(error) {
        return res.status(400).send(error.message)
      }
      user.save((err, user) => {
        if(err) {return res.status(400).send(err)}
        res.send({user, token})
      })
      
    })
  });
  
});

// Get Users Profile
router.get('/users', auth, (req, res) => {
  res.send(req.user)
});

// Update a Users details 
router.patch('/users', auth, (req, res) => {
  const allowedUpdates = ['name', 'email', 'password'];
  const updates = Object.keys(req.body);

  const isAllowed = updates.every((update) => {
    return allowedUpdates.includes(update);
  })

  if(!isAllowed) {
    return res.status(400).send({msg: 'Update not allowed'})
  }

  updates.forEach((update) => {
    req.user[update] = req.body[update];
  })

  req.user.save((err, user) => {
    if(err) { return res.status(400).send(err.message) }
    res.send({msg: `Hi, ${user.name}, update complete!`})
  })

})

// Delete User
router.delete('/users/me', auth, (req, res) => {
  req.user.remove((err, user) => {
    if(err) { return res.status(400).send(err.message) }
    res.send({msg: `${user.name}, your account has been deleted :(`})
  })
});


module.exports = router;