import express from 'express';

const app = express();
app.get('/', async (req, res) => {
    res.send('Hello world!');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`codelab-genai: listening on port ${port}`);
});