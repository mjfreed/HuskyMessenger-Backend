//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

var router = express.Router();


//Sends message to chatid with username and message.
router.post("/sendMessages", (req, res) => {
    let username = req.body['username'];
    let message = req.body['message'];
    let chatId = req.body['chatId'];
    if (!username || !message || !chatId) {
        res.send({
            success: false,
            error: "Username, message, or chatId not supplied"
        });
        return;
    }

    let insert = `INSERT INTO Messages(ChatId, Message, MemberId)
                  SELECT $1, $2, MemberId FROM Members 
                  WHERE Username=$3`
    db.none(insert, [chatId, message, username])
        .then(() => {
            res.send({
                success: true
            });
        }).catch((err) => {
            res.send({
                success: false,
                error: err,
            });
        });
});

/**
 * Returns list of messages after a certain time with:
 * Username
 * Message contents
 * Timestamp of message
 */
router.get("/getMessages", (req, res) => {
    let chatId = req.query['chatId'];
    let after = req.query['after'];
    let query = `SELECT Members.Username, Messages.Message,
    to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD
   HH24:MI:SS.US' ) AS Timestamp
    FROM Messages
   INNER JOIN Members ON Messages.MemberId=Members.MemberId
   WHERE ChatId=$2
   ORDER BY Timestamp ASC`
    console.log("THIS IS TIME" + after);


    db.manyOrNone(query, [after, chatId])
        .then((rows) => {
            res.send({
                messages: rows
            })
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
});

/**
 * Gets all messages after for a certain chatid.
 * 
 * Returns list of messages with:
 * Username
 * Message contents
 * Timestamp of message
 */
router.post("/getMessages2", (req, res) => {
    let chatId = req.body['chatId'];
    let query = `SELECT Members.Username, Messages.Message,
    to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD
   HH24:MI:SS.US' ) AS Timestamp
    FROM Messages
   INNER JOIN Members ON Messages.MemberId=Members.MemberId
   WHERE ChatId=$2
   ORDER BY Timestamp ASC`

    db.manyOrNone(query, [after, chatId])
        .then((rows) => {
            res.send({
                success: true,
                messages: rows
            })
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
});

/**
 * Gets all messages after for a certain chatid after certain time.
 * 
 * Returns list of messages with:
 * Username
 * Message contents
 * Chat ID
 * Timestamp of message
 */
router.post("/getMessages3", (req, res) => {
    let chatId = req.body['chatId'];
    let after = req.body['after'];
    let query = `SELECT Members.Username, Messages.Message, Messages.chatId,
    to_char(Messages.Timestamp AT TIME ZONE 'PDT', 'YYYY-MM-DD
   HH24:MI:SS.US' ) AS Timestamp
    FROM Messages
   INNER JOIN Members ON Messages.MemberId=Members.MemberId
   WHERE ChatId=$2
   ORDER BY Timestamp ASC`
    db.manyOrNone(query, [after, chatId])
        .then((rows) => {
            res.send({
                success: true,
                messages: rows
            })
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
});

/**
 * Gets all chats for a particular username
 * 
 * Returns list of all the chats a user is part of, including:
 * Chat name
 * Chat ID
 */
router.get("/getAllChats", (req, res) => {
    let username = req.query['username'];
    let query = "Select memberid from members where username='" + username + "'";
    db.manyOrNone(query)
        .then(rows => {
            var memberId = rows[0].memberid;
            console.log(rows[0].memberid);
            let insert = "select distinct chats.chatid,name from chatmembers join chats on chats.chatid = chatmembers.chatid where memberid=" + memberId;
            console.log(insert);
            db.manyOrNone(insert)
                .then(rows => {
                    res.send({
                        success: true,
                        chats: rows
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
 * Gets all chats for a particular username post request
 * 
 * Returns list of all the chats a user is part of, including:
 * Chat name
 * Chat ID
 */
router.post("/getAllChats", (req, res) => {
    let username = req.body['username'];
    let query = "Select memberid from members where username='" + username + "'";
    db.manyOrNone(query)
        .then(rows => {
            var memberId = rows[0].memberid;
            console.log(rows[0].memberid);
            let insert = "select distinct chats.chatid,name from chatmembers join chats on chats.chatid = chatmembers.chatid where memberid=" + memberId;
            console.log(insert);
            db.manyOrNone(insert)
                .then(rows => {
                    res.send({
                        success: true,
                        chats: rows
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


//Add a username to a chatmembers
router.post("/addUserToChat", (req, res) => {
    let username = req.body['username'];
    let chatId = req.body['chatId'];
    let query = "Select memberid from members where username='" + username + "'";
    db.manyOrNone(query)
        .then(rows => {
            var memberId = rows[0].memberid;
            let insert = "INSERT INTO chatmembers(ChatId, MemberId) Values(" + chatId + "," + memberId + ")";
            db.manyOrNone(insert)
                .then(rows_b => {
                    res.send({
                        success: true,
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

//Remove username from a chatid.
router.post("/removeUserFromChat", (req, res) => {
    let username = req.body['username'];
    let chatId = req.body['chatId'];
    let query = "Select memberid from members where username='" + username + "'";
    db.manyOrNone(query)
        .then(rows => {
            var memberId = rows[0].memberid;
            let insert = "DELETE FROM chatmembers WHERE chatmembers.chatid ='" + chatId + "' AND chatmembers.memberid ='" + memberId + "'";
            db.manyOrNone(insert)
                .then(rows_b => {
                    res.send({
                        success: true,
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

//Create a new chat with a specific name.
router.post("/addNewChat", (req, res) => {
    let temp = req.body['nameOfChat'];
    let query = "INSERT INTO CHATS(NAME) VALUES ('" + temp + "') RETURNING chatid";
    console.log(query);
    db.one(query)
        .then((rows) => {
            res.send({
                success: true,
                messages: rows
            })
        }).catch((err) => {
            res.send({
                success: false,
                error: err
            })
        });
});



module.exports = router;
