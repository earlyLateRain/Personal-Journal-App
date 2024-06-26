import * as sqlite3 from "sqlite3";

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database("journal.sqlite");
    this.init();
  }

  // This creates a table called 'entries' if that table doesn't exist.
  private init(): void {
    this.db.run(`CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            date TEXT
            )`);
  }

  // Creates a note
  public addEntry(
    title: string,
    content: string,
    callback: (err: Error | null, id?: number) => void
  ) {
    const date = new Date().toISOString();
    const sql = `INSERT INTO entries (title, content, date) VALUES (?, ?, ?)`;
    this.db.run(sql, [title, content, date], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.lastID);
    });
  }

  // Views all notes
  public getEntries(callback: (err: Error | null, rows?: any[]) => void): void {
    const sql = `SELECT * FROM entries ORDER BY date DESC`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  }

  // Views a single note
  public getEntry(
    id: number,
    callback: (err: Error | null, row?: any) => void
  ): void {
    const sql = `SELECT * FROM entries WHERE id = ?`;
    this.db.get(sql, [id], (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows);
    });
  }

  // Edit a note by updating it in the database
  public updateEntry(
    id: number,
    title: string,
    content: string,
    callback: (err: Error | null, changes?: number) => void
  ): void {
    const sql = `UPDATE entries SET title = ?, content = ? WHERE id = ?`;
    this.db.run(sql, [title, content, id], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    });
  }

  // Edit a note by updating it in the database
  public deleteEntry(
    id: number,
    callback: (err: Error | null, changes?: number) => void
  ): void {
    const sql = `DELETE FROM entries WHERE id = ?`;
    this.db.run(sql, [id], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    });
  }
}

export default Database;
