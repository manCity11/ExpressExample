const connexion = require('../config/db');

class Message {

    static create(content, callback) {

        connexion.query('INSERT INTO Messages SET CONTENT=?, CREATED_AT=?', [
            content,
            new Date()
        ], (err, result) => {
            if(err) {
                throw err;
            }

            callback(result);
        });
    }

    static all(callback) {

        connexion.query('SELECT * FROM Messages', (err, rows) => {
            if(err) {
                throw err;
            }
            callback(rows);
        })
    }

    static find(id, callback) {

        connexion.query('SELECT * FROM Messages WHERE ID=? LIMIT 1', [
            id
        ], (error, result) => {
            if(error) {
                throw error;
            }
            callback(result);
        })
    }
}

module.exports = Message;