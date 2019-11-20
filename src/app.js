const express = require('express');

const app = express();
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('hello dude.')
})

app.listen(port, () => {
  console.log('Ole cloth ears is listening on port ' + port);
})