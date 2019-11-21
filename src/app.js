const express = require('express');

require('./db/mongoose');

const app = express();
const port = process.env.PORT

app.use(express.json())



const usersRouter = require('./routers/usersRouter');
const tasksRouter = require('./routers/tasksRouter');



app.use(tasksRouter)
app.use(usersRouter)

app.listen(port, () => {
  console.log('Ole cloth ears is listening on port ' + port);
})