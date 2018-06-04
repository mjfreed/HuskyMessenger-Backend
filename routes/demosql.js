//express is the framework we're going to use to handle requests
const express = require('express');
//create a new instance of express
const app = express();

const bodyParser = require('body-parser');
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

// //pg-promise is a postgres library that uses javascript promises
// const pgp = require('pg-promise')();
// //we have tp set ssl usage to true for heroku to accept our connection
// pgp.pg.defaults.ssl = true;

// //create connection to heroku database
// let db;
// db = pgp('postgres://thzqzetrzalspm:103a2eef6260f3d2a75866da568398ab10a6fa76db6209773463703860601145@ec2-54-225-96-191.compute-1.amazonaws.com:5432/dcsu408sgfirae')

// if (!db) {
//     console.log("That shit don't exist braj");
//     process.exit(1);
// }

var router = express.Router();

router.post("/", (req, res) => {
    var name = req.body['name'];

    if (name) {
        let params = [name];
        db.none("INSERT INTO DEMO(Text) VALUES ($1)", params).then(() => {
            //We successfully added the name, let the user know
            res.send({
                success: true
            });
        }).catch((err) => {
            //log the error
            console.log(err);
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required information"
        });
    }
});

router.get("/", (req, res) => {
    db.manyOrNone('SELECT Text FROM Demo')
    //If successful, run function passed into .then()
    .then((data) => {
        res.send({
            success: true,
            names: data
        });
    }).catch((error) => {
        console.log(error);
        res.send({
            success: false,
            error: error
        })
    });
});

module.exports = router;