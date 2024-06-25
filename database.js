const sqlite3 = require('sqlite3');

class Database {
    constructor() {
        this.db = new sqlite3.Database('journal.sqlite');
        this.init();
    }

    // This creates a table called 'entries' if that table doesn't exist.
    init() {
        this.db.run(`CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            date TEXT
            )`);
    }

    // Creates a note
    addEntry(title, content, callback) {
        const date = new Date().toISOString();
        const sql = `INSERT INTO entries (title, content, date) VALUES (?, ?, ?)`;
        this.db.run(sql, [title, content, date], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, this.lastID)
        });
    }

    // Views all notes
    getEntries(callback) {
        const sql = `SELECT * FROM entries ORDER BY date DESC`;
        this.db.all(sql, [], (err, rows) => {
            if (err) {
                return callback(err);
            }
            callback(null, rows)
        });
    }
    
    // Views a single note
    getEntry(id, callback) {
        const sql = `SELECT * FROM entries WHERE id = ?`;
        this.db.get(sql, [id], (err, rows) => {
            if (err) {
                return callback(err);
            }
            callback(null, rows)
        });
    }
    
    // Edit a note by updating it in the database
    updateEntry(id, title, content, callback) {
        const sql = `UPDATE entries SET title = ?, content = ? WHERE id = ?`;
        this.db.get(sql, [title, content, id], (err) => {
            if (err) {
                return callback(err);
            }
            callback(null, this.changes);
        });
    }
    
    // Edit a note by updating it in the database
    deleteEntry(id, callback) {
        const sql = `DELETE FROM entries WHERE id = ?`;
        this.db.get(sql, [id], (err) => {
            if (err) {
                return callback(err);
            }
            callback(null, this.changes);
        });
    }
}

module.exports = new Database();
