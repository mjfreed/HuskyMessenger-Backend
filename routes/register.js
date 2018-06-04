/**
 * File that contains an endpoint that allows a user to attempt
 * to register for the app. If successful, the user's information is 
 * stored into the Members table of the DB.
 * 
 * @author Charles Bryan
 * @author Marshall Freed
 * @version 5/31/2018
 */

//express is the framework we're going to use to handle requests
const express = require('express');
//create a new instance of express
const app = express();

const bodyParser = require("body-parser");
//This allows parsing of the body of post requests, that are encoded in json
app.use(bodyParser.json());

//We use this create the SHA256 hash
const crypto = require("crypto");

//create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();

/**
 * Endpoint that allows a user to attempt to register for the app
 * by providing the required information.
 * 
 * @param first first name of user
 * @param last last name of user
 * @param username username of the user
 * @param email email address of the user
 * @param password password that the user chose
 */
router.post('/', (req, res) => {
    res.type("application/json");

    //retrieve data from query params
    var first = req.body["first"];
    var last = req.body["last"];
    var username = req.body["username"];
    var email = req.body["email"];
    var password = req.body["password"];
    var code = Math.floor((Math.random() * 9999) + 1000);
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if (first && last && username && email && password) {
        //we're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch a fucking youtood vid
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);

        //Use .none() since no result gets returned from an INSERT in SQL
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL injection
        let params = [first, last, username, email, code, salted_hash, salt];
        db.none("INSERT INTO MEMBERS(FirstName, LastName, Username, Email, Code, Password, Salt) VALUES ($1, $2, $3, $4, $5, $6, $7)", params)
        .then(() => {
            //We successfully added the user let the user know
            res.send({
                success: true,
                userEmail: email
            });
            sendEmail("tcss450group3@gmail.com", email, "Welcome!", "Welcome to our app! Please verify by entering this code in the app: " + code);
        }).catch((err) => {
            //log the error
            console.log(err);
            //If we get an error, it most likely means the account already exists
            //let use know they tried to make an acount that exists already
            res.send({
                success: false,
                error: err,
                userEmail: email
            });
        });
    } else {
        res.send({
            success: false,
            input: req.body,
            error: "Missing required user information"
        });
    }
});

module.exports = router;