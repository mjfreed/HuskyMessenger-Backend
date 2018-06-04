const pgp = require('pg-promise')();
//We have to set ssl usage to true for Heroku to accept our connection
pgp.pg.defaults.ssl = true;

//create connection to Heroku database
const db = pgp('postgres://vbtpmortnzvlfi:fdabfa54aa07942aea6f20a4bc3e16de9b034c2024bb5752ecf12e21fead2fd8@ec2-54-204-46-236.compute-1.amazonaws.com:5432/dahmud0520po3f');

if(!db) {
    console.log("Dat shit don't exist, yo");
    process.exit(1);
}

module.exports = db;