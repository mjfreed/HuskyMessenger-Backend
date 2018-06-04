/**
 * File that contains an endpoint that allows a user of the app
 * to attempt to log in.
 * 
 * @author Charles Bryan
 * @author Marshall Freed
 * @version 5/31/2018
 */

//express is the framework we're going to ues to handle requests
const express = require('express');
//create new instance of express
const app = express();

const FormData = require("form-data");

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
app.use(bodyParser.json());

//create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

var router = express.Router();

//app.get('/users') means accept http 'GET' requrests at path '/users'

/**
 * Endpoint that allows the user to attempt to log in to the app
 * given that the credentials provided in the body of the request
 * are correct.
 * 
 * @param username username of the user trying to log in
 * @param password password that the user typed in
 */
router.post('/', (req, res) => {
    let user = req.body['username'];
    let theirPw = req.body['password'];
    let wasSuccessful = false;
    if (user && theirPw) {
        //using the 'one' method means that only one row should be returned
        db.one('SELECT Password, Salt, Verification, Email FROM Members WHERE username=$1', [user])
        //if successful, run function passed into .then()
        .then(row => {
            let salt = row['salt'];
            let ourSaltedHash = row['password']; //retrieve our copy of the password
            let verification = row['verification'];
            let email = row['email'];
            let theirSaltedHash = getHash(theirPw, salt); //combined their password with our salt, then hash
            let wasCorrectPw = ourSaltedHash === theirSaltedHash; //did our salted hash match their salted hash?
            let verify = verification === 1;
            //send whether they had the correct password or not
            res.send({
                success: wasCorrectPw,
                verification: verify,
                userEmail: email
            });
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //if anything happened, it wasn't successful
            res.send({
                success: false,
                message: err,
                verification: '0'
            });
        });
     } else {
         res.send({
             success: false,
             message: 'missing credentials',
             verification: '0'
         });
     }
});

module.exports = router;