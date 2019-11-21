const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Task = require('./task');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if(!validator.isEmail(value)) {
        throw new Error('Invalid Email MAN!!!')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {timestamps: true});


userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id', 
	foreignField: 'owner'
})

userSchema.pre('save', async function(next) {
  if(this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
    next();
  }else {
    next();
  }
})

userSchema.pre('remove', async function(next) {
  Task.deleteMany({owner: this._id}, (err, doc) => {
    if(err) { throw new Error(err.message)}
    console.log('pre hook remove ', doc)
    next()
  })
})

userSchema.methods.toJSON = function() {
   const userObj = this.toObject();
   delete userObj.tokens;
   delete userObj.password;
   return userObj;
}

userSchema.methods.getAuthToken = function(callback) {
  const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, {expiresIn: '7 days'});
  this.tokens = this.tokens.concat({token})
  callback(null, token)
}

userSchema.statics.findByCredentials = function(email, password, callback) {
  User.findOne({email}, (err, user) => {
    if(err) {
      return callback(err);
    }
    if(!user) {
      return callback(err);
    }
    
    bcrypt.compare(password, user.password, (err, authorized) => {
      if(err) { return callback(err)}
      if(!authorized) { return callback('Unauthorized')}
      callback(null, user)
    })
  })

}

const User = mongoose.model('User', userSchema);

module.exports = User;