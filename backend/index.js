const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const KEY_PATH = './key.json';
const PROJECT_ID = require(KEY_PATH).project_id;

const sessionClient = new dialogflow.SessionsClient({ keyFilename: KEY_PATH });

app.post('/chat', async (req, res) => {
  const message = req.body.message;
  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(PROJECT_ID, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).json({ reply: 'Something went wrong!' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
