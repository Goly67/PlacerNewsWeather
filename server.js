const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    try {
        const response = await axios.get(url);
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching the resource');
    }
});

app.listen(PORT, () => {
    console.log(`CORS proxy server running at http://localhost:${PORT}`);
});
