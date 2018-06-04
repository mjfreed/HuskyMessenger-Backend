/**
 * File that contains all endpoints associated with transactions
 * between connections. This includes accepting, declining, adding,
 * removing connections and connection requests and much more.
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
 * Endpoint that returns the users that have requested a
 * connection to the current user of the app via GET request
 * 
 * @param username the username of the current user
 */
router.get('/getRequests', (req, res) => {
    let username = req.query['username'];
    if (!username) {
        res.send({
            success: false,
            error: "Username not supplied"
        });
        return;
    }
    let query = `SELECT username, firstname, lastname
                 FROM members
                 WHERE memberid
                 IN (
                     SELECT memberid_a
                     FROM contacts
                     WHERE memberid_b = (
                         SELECT memberid
                         FROM members
                         WHERE username=$1
                     )
                     AND verified=0
                    )`;
    db.manyOrNone(query, [username])
    .then((rows) => {
        res.send({
            requests: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Endpoint that returns the users that have requested a
 * connection to the current user of the app via POST request
 * 
 * @param username the username of the current user
 */
router.post('/getRequests2', (req, res) => {
    let username = req.body['username'];
    if (!username) {
        res.send({
            success: false,
            error: "Username not supplied"
        });
        return;
    }
    let query = `SELECT username, firstname, lastname
                 FROM members
                 WHERE memberid
                 IN (
                     SELECT memberid_a
                     FROM contacts
                     WHERE memberid_b = (
                         SELECT memberid
                         FROM members
                         WHERE username=$1
                     )
                     AND verified=0
                    )`;
    db.manyOrNone(query, [username])
    .then((rows) => {
        res.send({
            success: true,
            requests: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Endpoint that returns the current user's pending connection
 * requests to other users of the app via POST request
 * 
 * @param username the username of the current user
 */
router.post('/getPendingRequests', (req, res) => {
    let username = req.body['username'];
    if (!username) {
        res.send({
            success: false,
            error: "Username not supplied"
        });
        return;
    }
    let query = `SELECT username, firstname, lastname
                 FROM members
                 WHERE memberid
                 IN (
                     SELECT memberid_b
                     FROM contacts
                     WHERE memberid_a = (
                         SELECT memberid
                         FROM members
                         WHERE username=$1
                     )
                     AND verified=0
                    )`;
    db.manyOrNone(query, [username])
    .then((rows) => {
        res.send({
            success: true,
            requests: rows
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Endpoint that returns all of the current user's contacts on both
 * columns of the Contacts table via POST request
 * 
 * @param username username of the current user
 */
router.post("/getContacts", (req, res) => {
    let username = req.body['username'];
    let query_a = `SELECT username, firstname, lastname, email
    FROM members 
    WHERE memberid 
    IN (
        SELECT memberid_a 
        FROM contacts 
        WHERE memberid_b=(
            SELECT memberid 
            FROM members 
            WHERE username=$1
        ) 
        AND verified=1
    )`;
    let query_b = `SELECT username, firstname, lastname, email 
                        FROM members 
                        WHERE memberid 
                        IN (
                            SELECT memberid_b 
                            FROM contacts 
                            WHERE memberid_a=(
                                SELECT memberid 
                                FROM members 
                                WHERE username=$1
                            ) 
                            AND verified=1
                        )`;

    db.manyOrNone(query_a, [username])
    .then(rows_a => {
        db.manyOrNone(query_b, [username])
        .then(rows_b => {
            res.send( {
                success: true,
                connections_a: rows_a,
                connections_b: rows_b
            })
        })
        .catch((err) => {
            res.send({
                success: false,
                message: "bad query_b",
                error: err
            })
        });
    })
    .catch((err) => {
        res.send({
            success: false,
            message: "bad query_a",
            error: err
        })
    });
});

/**
 * Endpoint that allows the current user to request a connection to
 * another user of the app by placing their memberids into the Contacts
 * table
 * 
 * @param username username of the current user
 * @param usernameB username of person the current user wants to add
 */
router.post('/requestContact', (req, res) => {
    let userA = req.body['username'];
    let userB = req.body['usernameB'];
    if (!userA || !userB) {
        res.send({
            success: false,
            error: "memberID for user A or user B not supplied"
        });
        return;
    }
    let query = `INSERT INTO Contacts(memberid_a, memberid_b)
                 VALUES(
                     (SELECT memberid
                      FROM Members
                      WHERE username=$1), (SELECT memberid
                      FROM Members
                      WHERE username=$2)
                 )`;
    db.none(query, [userA, userB])
    .then(() => {
        res.send({
            success: true,
            username: userB
        })
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Endpoint that allows the current user of the app to accept
 * a connection request that another user has made to them
 * 
 * @param usernameA username of the user that requested
 * @param usernameB username of the user that has been requested (current user)
 */
router.post('/verifyContactRequest', (req, res) => {
    let userA = req.body['usernameA'];
    let userB = req.body['usernameB'];
    if (!userA || !userB) {
        res.send({
            success: false,
            error: "missing credentials for userA or userB"
        });
        return;
    }
    let query = `UPDATE Contacts 
                 SET verified='1'
                 WHERE memberid_a = (
                     SELECT memberid 
                     FROM Members
                     WHERE username = $1 )
                 AND memberid_b = (
                     SELECT memberid
                     FROM Members
                     WHERE username = $2 )`;
    db.none(query, [userA, userB])
    .then(() => {
        res.send({
            success: true,
            username: userA,
            accept: true
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

/**
 * Endpoint that allows user to decline a connection request from a 
 * user that has made a connection requested to them. Endpoint removes the entry
 * from the Contacts table, so endpoint can be used to delete contacts as well.
 * 
 * @param usernameA username of the user that has originally requested
 * @param usernameB username of the user that the request was originally made to
 */
router.post('/declineContactRequest', (req, res) => {
    let userA = req.body['usernameA'];
    let userB = req.body['usernameB'];
    if (!userA || !userB) {
        res.send({
            success: false,
            error: "missing credentials for userA or userB"
        });
        return;
    }
    let query = `DELETE FROM Contacts
                 WHERE memberid_a = (
                     SELECT memberid 
                     FROM Members
                     WHERE username = $1 )
                 AND memberid_b = (
                     SELECT memberid
                     FROM Members
                     WHERE username = $2 )`;
    db.none(query, [userA, userB])
    .then(() => {
        res.send({
            success: true,
            username: userA,
            usernameB: userB,
            accept: false
        });
    }).catch((err) => {
        res.send({
            success: false,
            error: err
        });
    });
});

module.exports = router;