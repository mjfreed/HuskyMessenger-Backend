/**
 * File that contains endpoints associated with a user attempting to
 * reset their password in the event that they have forgotten it.
 * 
 * @author Marshall Freed
 * @version 5/31/2018
 */

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const crypto = require("crypto");
app.use(bodyParser.json());

let db = require('../utilities/utils').db;
let getHash = require('../utilities/utils').getHash;
let sendEmail = require('../utilities/utils').sendEmail;

var router = express.Router();

/**
 * Endpoint that checks whether the email that the user has 
 * provided matches an email associated with an account in the
 * DB currently. If so, service will send an email with a randomly
 * generated code for the user to type in to the app.
 * 
 * @param email the email the user has provided
 */
router.post('/startReset', (req, res) => {
    var email = req.body['email'];
    var code = Math.floor((Math.random() * 9999) + 1000);
    var params = [code, email];
    if (!email) {
        res.send({
            success: false,
            reason: 0,
            error: "missing email input"
        });
    } else {
        db.one('SELECT COUNT (*) FROM Members WHERE email=$1', email)
        .then(row => {
            let count = row['count'];
            if (count === "0") {
                res.send({
                    success: false,
                    reason: 1,
                    error: "email is not associated with an account"
                });
            } else {
                db.none(`UPDATE Members SET code=$1 WHERE email=$2`, params)
                .then(() => {
                    res.send({
                        success: true
                    });
                    sendEmail("tcss450group3@gmail.com", email, "Verify Account",
                    `Looks like you forgot your password...\nTo verify your account, please enter this code into the app: ` + code);
                })
                .catch((err) => {
                    console.log(err);
                    res.send({
                        success: false,
                        reason: 2,
                        e: email,
                        error: err
                    });
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.send({
                success: false,
                reason: 3,
                msg: "Select query went wrong",
                error: err
            });
        });
    }
});

/**
 * Endpoint that checks whether the code that the user typed into
 * the app matches the same code that was sent to them in the
 * email
 * 
 * @param code the code the user typed in
 */
router.post('/verifyReset', (req,res) => {
    let email = req.body['email'];
    let code = req.body['code'];
    if (!(code && email)) {
        res.send({
            success: false,
            error: "code or email was not supplied"
        });
    } else {
        db.one('SELECT Code FROM Members WHERE email=$1', email)
        .then(row => {
            let dbCode = row['code'];
            let wasCodeMatching = parseInt(code) === dbCode;
            if (wasCodeMatching) {
                res.send({
                    success: true
                });
            } else {
                res.send({
                    success: false,
                    error: "code was not matching"
                });
            }
        })
        .catch((err) => {
            res.send({
                success: false,
                error: err
            });
        });
    }
});

/**
 * Endpoint that changes the password in the DB to the password that 
 * the user has entered into the app.
 * 
 * @param email email of the user trying to change their password
 * @param password the new password the user typed in to the app
 */
router.post('/passwordReset', (req, res) => {
    let email = req.body['email'];
    let password = req.body['password'];
    if (!password) {
        res.send({
            success: false,
            error: "password was not supplied"
        });
    } else {
        let salt = crypto.randomBytes(32).toString("hex");
        let salted_hash = getHash(password, salt);

        let params = [salted_hash, salt, email];
        db.none("UPDATE Members SET password=$1, salt=$2 WHERE email=$3", params)
        .then(() => {
            res.send({
                success: true
            });
        })
        .catch((err) => {
            console.log(err);
            res.send({
                success: false,
                error: err
            });
        });
    }
});


module.exports = router;