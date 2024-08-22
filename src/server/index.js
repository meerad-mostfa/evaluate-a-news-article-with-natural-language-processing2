const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the index.html file for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Constants for API URL and key
const MEANINGCLOUD_URL = 'https://api.meaningcloud.com/sentiment-2.1';
const MEANINGCLOUD_API_KEY = process.env.MEANINGCLOUD_API_KEY;

// POST route for sentiment analysis
app.post('/analyze', async (req, res) => {
    const { text: userText } = req.body;

    try {
        const response = await axios.post(MEANINGCLOUD_URL, null, {
            params: {
                key: MEANINGCLOUD_API_KEY,
                txt: userText,
                lang: 'en' // Specify the language
            }
        });

        // Log the response data to verify structure
        console.log(response.data);

        // Destructure and process the response data
        const { score_tag, confidence, subjectivity, irony } = response.data;

        // Create a human-readable summary
        const resultText = `
            Sentiment: ${mapSentiment(score_tag)}
            Confidence: ${confidence}%
            Subjectivity: ${subjectivity === 'SUBJECTIVE' ? 'Subjective' : 'Objective'}
            Irony: ${irony === 'IRONIC' ? 'Ironic' : 'Non-Ironic'}
        `.trim();

        // Log the resultText to verify content
        console.log(resultText);

        // Send the summarized result back to the client
        res.send(resultText);
    } catch (error) {
        console.error('Error calling MeaningCloud API:', error);
        res.status(500).send('Error analyzing text');
    }
});

// Function to map score_tag to human-readable sentiment
function mapSentiment(scoreTag) {
    switch (scoreTag) {
        case 'P+': return 'Strong Positive';
        case 'P': return 'Positive';
        case 'NEU': return 'Neutral';
        case 'N': return 'Negative';
        case 'N+': return 'Strong Negative';
        case 'NONE': return 'No Sentiment';
        default: return 'Unknown';
    }
}

// Start the server
app.listen(8000, () => {
    console.log('Server listening on port 8000');
});
