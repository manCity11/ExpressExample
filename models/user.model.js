const connexion = require('../config/db');

class User {

    static add(username, password, callback) {

        connexion.query('INSERT INTO Users SET USERNAME=?, PASSWORD=?', [
            username,
            password,
        ], (err, result) => {
            if(err){
                throw err;
            }

            callback(result);
        });
    }

    static find(username, callback) {

        connexion.query('SELECT * FROM Users WHERE USERNAME=?', [
            username
        ], (err, result) => {
            if(err) {
                throw err;
            }

            callback(result[0]);
        });
    }
}

module.exports = User;