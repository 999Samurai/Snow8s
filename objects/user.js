class User {

    constructor(conn) {
        this.conn = conn;
    }

    register(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('INSERT INTO users (user_id) VALUES (?)', [userId]);
            resolve(true);
        });
    }

    checkIfQueue(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT COUNT(*) AS total FROM users WHERE in_queue = 1 AND user_id = ?', [userId], function (error, results) {
                if(!error) {
                    resolve(results[0].total > 0);
                } else {
                    resolve("Error checking queue list.");
                }
            });
        });
    }

    checkIfInGame(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT COUNT(*) AS total FROM queue WHERE user_id = ?', [userId], function (error, results) {
                if(!error) {
                    resolve(results[0].total > 0);
                } else {
                    resolve("Error checking queue list.");
                }
            });
        });
    }

    checkRegister(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT COUNT(*) AS total FROM users WHERE user_id = ?', [userId], function (error, results) {

                if(error) { // Error

                    console.log(error);
                    reject("Error checking if user is registered.");
                    
                } else if(results[0].total == 0) { // Register User

                    resolve(false);

                } else if(results[0].total >= 1) { // Already registered

                    resolve(true);

                }
            });
        });
    }

    addToQueue(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('UPDATE users SET in_queue = 1 WHERE user_id = ?', [userId], function(error) {
                if(!error) {
                    resolve(true);
                } else {
                    resolve("Error adding player to queue.");
                }
            });
        });
    }

    checkQueueList() {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT COUNT(*) AS total FROM users WHERE in_queue = 1', function (error, results) {
                if(!error) {
                    resolve(results[0].total);
                } else {
                    resolve("Error checking queue list.");
                }
            });
        });
    }

    getQueueList() {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT * FROM users WHERE in_queue = 1 LIMIT 8', function (error, results) {
                if(!error) {
                    resolve(results);
                } else {
                    reject("Error getting queue list.");
                }
            });
        });
    }
    
    resetQueue() {
        return new Promise((resolve, reject) => {
            this.conn.query('UPDATE users SET in_queue = 0', function (error, results) {
                if(!error) {
                    resolve(true);
                } else {
                    reject("Error resetting queue.");
                }
            });
        });
    }

    removeFromQueue(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('UPDATE users SET in_queue = 0 WHERE user_id = ?', [userId], function (error, results) {
                if(!error) {
                    resolve(true);
                } else {
                    reject("Error removing from queue.");
                }
            });
        });
    }

    createLobby() {
        return new Promise((resolve, reject) => {
            this.conn.query('INSERT INTO lobby() VALUES ()', async function (error, results) {
                if(!error) {
                    resolve(results.insertId);
                } else {
                    reject("Error creating lobby.");
                }
            });
        });
    }

    addPlayersToLobby(playersArray, lobbyNumber) {
        return new Promise((resolve, reject) => {

            var i;
            let uploadText = "";

            for(i = 0; i < playersArray.length; i++) {
                if(i == 0) {
                    uploadText += "(" + playersArray[i].user_id + ", " + lobbyNumber + ")";
                } else {
                    uploadText += ", (" + playersArray[i].user_id + ", " + lobbyNumber + ")";
                }
            }

            let connString = 'INSERT INTO queue(user_id, lobby_id) VALUES ' + uploadText;

            this.conn.query(connString, function (error, results) {
                if(!error) {
                    resolve(results);
                } else {
                    reject("Error inserting players to queue.");
                }
            });
        });
    }

    setPlayerReady(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('UPDATE queue SET is_ready = 1 WHERE user_id = ?', [userId], function (error, results) {
                if(!error) {
                    resolve(true);
                } else {
                    reject("Failing when trying to put ready on player.");
                }
            });
        });
    }

    playerDodge(userId, lobbyId) {
        return new Promise((resolve, reject) => {
            this.conn.query('INSERT INTO dodges(user_id, lobby_id) VALUES(?, ?)', [userId, lobbyId], function (error, results) {
                if(!error) {
                    resolve(true);
                } else {
                    reject("Failing when trying to add the dodge to the player.");
                }
            });
        });
    }

    checkDodge(lobbyId) {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT COUNT(*) AS total FROM dodges WHERE lobby_id = ?', [lobbyId], function (error, results) {
                if(!error) {
                    resolve(results[0].total > 0);
                } else {
                    resolve("Error checking dodges.");
                }
            });
        });
    }

    getLobbyPlayers(lobbyId) {
        return new Promise((resolve, reject) => {
            this.conn.query('SELECT * FROM queue WHERE lobby_id = ?', [lobbyId], function (error, results) {
                if(!error) {
                    resolve(results);
                } else {
                    resolve("Error getting players from lobby.");
                }
            });
        });
    }

    deleteLobby(lobbyId) {
        return new Promise((resolve, reject) => {
            this.conn.query('DELETE FROM lobby WHERE id = ?', [lobbyId]);
            resolve(true);
        });
    }

    removeFromQueue(userId) {
        return new Promise((resolve, reject) => {
            this.conn.query('UPDATE users SET in_queue = 0 WHERE user_id = ?', [userId], function (error, results) {
                if(!error) {
                    resolve(true);
                } else {
                    reject("Error removing player from queue.");
                }
            });
        });
    }
}

module.exports = User;
