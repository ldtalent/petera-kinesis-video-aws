const express = require('express');
const { kinesis } = require('./util/kinesis');
require('dotenv').config();

const { json, urlencoded } = express;
const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.status(200).send({
    message: 'Welcome to our AWS Kinesis Video Streaming API'
  })
});

app.get('/kinesis-video-url', async (req, res) => {
  const response = await kinesis.createChannel('New_Tutorial_Channel', 'MASTER');
  return res.status(200).json(response);
})

app.listen(3003, () => {
  console.log(`app running on port: 3003`);
});