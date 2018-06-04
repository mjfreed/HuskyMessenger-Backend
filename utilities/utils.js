//Get the connection to the Heroku database
let db = require('./sql-conn.js');

//We use this to create the SHA256 hash
const crypto = require('crypto');
const FormData = require('form-data');

// function sendEmail(from, to, subject, message) {
//     let form = new FormData();
//     form.append("from", from);
//     form.append("to", to);
//     form.append("subject", subject);
//     form.append("message", message);
//     form.submit("http://cssgate.insttech.washington.edu/~cfb3/mail.php", (err, res) => {
//         if(err) { 
//             console.error(err);
//             console.log("OH BOY\nOH BOY\nOH BOY\nOH BOY\nOH BOY\nOH BOY");
//         }
//         console.log(res);
//     });
// }

var nodemailer = require('nodemailer');

function sendEmail(from1, to1, subject1, message) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user : 'tcss450group3@gmail.com',
            pass: '8======D'
        }
    });

    var mailOptions = {
        from : from1,
        to : to1,
        subject : subject1,
        text : message
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

/**
 * Method to get a salted hash
 * We put this in its own method to keep consistency
 * @param {string} pw the password to hash
 * @param {string} salt the salt to use when hashing
 */
function getHash(pw, salt) {
    return crypto.createHash("sha256").update(pw + salt).digest("hex");
}

module.exports = {
    db, getHash, sendEmail
};