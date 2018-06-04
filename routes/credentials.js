/**
 * File that contains endpoints that is related to searching
 * for other users of the app and obtaining their information
 * based on different parameters.
 * 
 * @author Marshall Freed
 * @version 5/31/2018
 */

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

let db = require('../utilities/utils').db;

var router = express.Router();

/**
 * Endpoint that returns the user's information matching the
 * memberid given to the endpoint in the request body
 * 
 * @param memberd the user's memberid the current user is searching for
 */
router.post('/getCredentialsFromId', (req, res) => {
    let memberId = req.body['memberId'];
    if (!memberId) {
        res.send({
            success: false,
            error: "ID not supplied"
        });
        return;
    }
    let query = `SELECT firstname, lastname, username, email
                 FROM Members 
                 WHERE memberid=$1`
    db.one(query, [memberId])
    .then((row) => {
        let firstname = row['firstname'];
        let lastname = row['lastname'];
        let user = row['username'];
        let address = row['email'];

        res.send({
            success: true,
            first: firstname,
            last: lastname,
            username: user,
            email: address
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Returns the the information of any user that has a matching set of
 * characters in their username that is provided in the request body.
 * 
 * @param username set of characters in username of all users to search for
 */
router.post('/getCredentialsFromUsername', (req, res) => {
    let username = req.body['username'];
    if (!username) {
        res.send({
            success: false,
            error: "username not supplied"
        });
        return;
    }
    let query = `SELECT firstname, username, lastname, memberid, email
                 FROM Members 
                 WHERE upper(username) LIKE $1`
    db.manyOrNone(query, [ '%' + username + '%'])
    .then((rows) => {
        res.send({
            success: true,
            results: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Returns the the information of any user that has a matching set of
 * characters in their first name that is provided in the request body.
 * 
 * @param firstname set of characters in first name of all users to search for
 */
router.post('/getCredentialsFromFirst', (req, res) => {
    let first = req.body['firstname'];
    if (!first) {
        res.send({
            success: false,
            error: "first name not supplied"
        });
        return;
    }
    let query = `SELECT firstname, memberid, lastname, username, email
                 FROM Members 
                 WHERE upper(firstname) LIKE $1`
    db.manyOrNone(query, ['%' + first + '%'])
    .then((rows) => {
        res.send({
            success: true,
            results: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Returns the the information of any user that has a matching set of
 * characters in their last name that is provided in the request body.
 * 
 * @param lastname set of characters in last name of all users to search for
 */
router.post('/getCredentialsFromLast', (req, res) => {
    let last = req.body['lastname'];
    if (!last) {
        res.send({
            success: false,
            error: "last name not supplied"
        });
        return;
    }
    let query = `SELECT lastname, memberid, firstname, username, email
                 FROM Members 
                 WHERE upper(lastname) LIKE $1`
    db.manyOrNone(query, ['%' + last + '%'])
    .then((rows) => {
        res.send({
            success: true,
            results: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Returns the the information of any user that has a matching set of
 * characters in their email address that is provided in the request body.
 * 
 * @param email set of characters in email of all users to search for
 */
router.post('/getCredentialsFromEmail', (req, res) => {
    let email = req.body['email'];
    if (!email) {
        res.send({
            success: false,
            error: "email not supplied"
        });
        return;
    }
    let query = `SELECT lastname, memberid, firstname, username, email
                 FROM Members 
                 WHERE upper(email) LIKE $1`
    db.manyOrNone(query, ['%' + email + '%'])
    .then((rows) => {
        res.send({
            success: true,
            results: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

module.exports = router;