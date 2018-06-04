/**
 * File that contains a single endpoint that validates the
 * user's email address
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
 * Endpoint that attempts to authenticate a user's email address by checking
 * if the code the user entered into the app matches the code that was sent
 * to their email address
 * 
 * @param email the user's email address
 * @param code the code the user typed in to the app
 */
router.post('/', (req, res) => {
    let email = req.body['email'];
    let userCode = req.body['code'];
    if (email && userCode) {
        db.one('SELECT Code FROM Members WHERE Email=$1', [email])
        .then(row => {
            let dbCode = row['code'];
            let wasCodeMatching = parseInt(userCode) === dbCode;
            if (wasCodeMatching) {
                db.none('UPDATE Members SET verification = 1 WHERE email=$1', [email])
                .then(() => {
                    res.send({
                        success: true
                    });
                }).catch((err) => {
                    console.log(err);
                    res.send({
                        success: false,
                        error: err
                    });
                });
            } else {
                res.send({
                    success: false,
                    error: "Code was not matching"
                });
            }
        }).catch((err) => {
            console.log("Bad db query");
            res.send({
                success: false,
                error: err
            });
        });
    } else {
        res.send({
            success: false,
            error: "Missing required information"
        });
    }
    
});

module.exports = router;