const express = require('express');

const auth = require('../middleware/auth');
const Task = require('../models/task');

const router = new express.Router();

// Create A New Task
router.post('/tasks', auth, (req, res) => {
  console.log(req.user)
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  task.save((err, savedTask) => {
    if(err) { return res.status(400).send(err.message)}
    res.send({msg: 'Task Saved!', savedTask})
  })
})

// Get All Tasks For A User
router.get('/tasks', auth, async (req, res) => {
  try {
    req.user.tasks = await req.user.populate('tasks').execPopulate();
    console.log(req.user.tasks)
    res.send({user: req.user})
  } catch (err) {
    res.status(400).send(err.message);
  }

});

// Update A Task
router.patch('/tasks/:id', auth, (req, res) => {
   const allowedUpdates = ['description', 'completed'];
   const updates = Object.keys(req.body);
   const isAllowed = updates.every((update) => {
     return allowedUpdates.includes(update)
   })
   if(!isAllowed) { return res.status(400).send({msg:'Update not allowed!'})}

   Task.findOne({_id: req.params.id, owner: req.user._id}, (err, task) => {
    if(err) { return res.status(400).send(err.message) }
    if(!task) { return res.status(404).send() }

    // update task instance then save to db
    updates.forEach((update) => {
      task[update] = req.body[update]
    });
    task.save((err, task) => {
      if(err) { return res.status(400).send(err.message) }
      res.send({msg: 'Task Updated', task})
    })
   })

})

// Delete A Task
router.delete('/tasks/:id', auth, (req, res) => {
  Task.findOneAndDelete({_id: req.params.id, owner: req.user._id}, (err, task) => {
    if(err) { return res.status(400).send(err.message) }
    if(!task) { return res.status(404).send() }
    res.send({msg: 'Task Deleted', task})
  })
})

// Delete All Tasks
router.delete('/tasks', auth, (req, res) => {
  Task.deleteMany({owner: req.user._id}, (err, doc) => {
    if(err) { return res.status(400).send(err.message) }
    res.send(doc)
  })
});


module.exports = router;