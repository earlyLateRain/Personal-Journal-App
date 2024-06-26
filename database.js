"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require("sqlite3");
var Database = /** @class */ (function () {
    function Database() {
        this.db = new sqlite3.Database("journal.sqlite");
        this.init();
    }
    // This creates a table called 'entries' if that table doesn't exist.
    Database.prototype.init = function () {
        this.db.run("CREATE TABLE IF NOT EXISTS entries (\n            id INTEGER PRIMARY KEY AUTOINCREMENT,\n            title TEXT,\n            content TEXT,\n            date TEXT\n            )");
    };
    // Creates a note
    Database.prototype.addEntry = function (title, content, callback) {
        var date = new Date().toISOString();
        var sql = "INSERT INTO entries (title, content, date) VALUES (?, ?, ?)";
        this.db.run(sql, [title, content, date], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, this.lastID);
        });
    };
    // Views all notes
    Database.prototype.getEntries = function (callback) {
        var sql = "SELECT * FROM entries ORDER BY date DESC";
        this.db.all(sql, [], function (err, rows) {
            if (err) {
                return callback(err);
            }
            callback(null, rows);
        });
    };
    // Views a single note
    Database.prototype.getEntry = function (id, callback) {
        var sql = "SELECT * FROM entries WHERE id = ?";
        this.db.get(sql, [id], function (err, rows) {
            if (err) {
                return callback(err);
            }
            callback(null, rows);
        });
    };
    // Edit a note by updating it in the database
    Database.prototype.updateEntry = function (id, title, content, callback) {
        var sql = "UPDATE entries SET title = ?, content = ? WHERE id = ?";
        this.db.run(sql, [title, content, id], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, this.changes);
        });
    };
    // Edit a note by updating it in the database
    Database.prototype.deleteEntry = function (id, callback) {
        var sql = "DELETE FROM entries WHERE id = ?";
        this.db.run(sql, [id], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, this.changes);
        });
    };
    return Database;
}());
exports.default = Database;
