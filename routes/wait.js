const express = require('express');
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

var router = express.Router();

router.get("/", (req, res) => {
    setTimeout(() => {
        res.send({
            message: "Thanks for waiting"
        });
    } , 1000);
});

router.post("/", (req, res) => {
    setTimeout(() => {
        res.send({
            message: "Hello, " + req.body['name'] + " thanks for waiting!"
        });
    }, 1000);
});

module.exports = router;