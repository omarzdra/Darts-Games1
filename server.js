const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./game_stats.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.exec(`
    CREATE TABLE IF NOT EXISTS game_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_name VARCHAR(40) NOT NULL,
        player_id INTEGER NOT NULL,
        total_score INTEGER NOT NULL,
        total_rounds INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table created or already exists.');
      }
    });
  }
});

const sqlFilePath = path.join(__dirname, 'game_stats.sql');

const sqlInit = `
  CREATE TABLE IF NOT EXISTS game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_name VARCHAR(40) NOT NULL,
    player_id INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    total_rounds INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

`;

db.exec(sqlInit, (err) => {
  if (err) {
    console.error('Database initialization error:', err.message);
  } else {
    console.log('Database successfully initialized.');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/submit', (req, res) => {
  const { game_name, player_id, total_score, total_rounds } = req.body;

  if (!player_id || total_score === undefined || total_rounds === undefined || game_name===undefined) {
    return res.status(400).json({ error: 'Manjkajoči podatki.' });
  }

  //const avg = total_score / total_rounds;
  const query = `
    INSERT INTO game_stats (game_name, player_id, total_score, total_rounds)
    VALUES (?, ?, ?)
  `;

  db.run(query, [game_name, player_id, total_score, total_rounds], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/stats', (req, res) => {
  const query = `SELECT * FROM game_stats ORDER BY created_at DESC`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Fetched stats:', rows);
    res.json(rows);
  });
});

app.post('/api/stats', (req,res) => {
  const { game_name, player_id, total_score, total_rounds } = req.body;

  if (!player_id || total_score === undefined || total_rounds === undefined || game_name===undefined) {
    return res.status(400).json({ error: 'Manjkajoči podatki.' });
  }

  //const avg = total_score / total_rounds;
  const query = `
    INSERT INTO game_stats (game_name, player_id, total_score, total_rounds)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [game_name, player_id, total_score, total_rounds], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
})
/*app.get('/api/test', (req, res) => {
  db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ tables: row });
  });
});*/


app.get('/api/stats/:player_id', (req, res) => {
  const playerId = req.params.player_id;
  db.all(
    `SELECT * FROM game_stats WHERE player_id = ? ORDER BY created_at DESC`,
    [playerId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.delete('/api/stats/:id', (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM game_stats WHERE id = ?`;

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting game:', err);
      return res.status(500).json({ error: 'Failed to delete game' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ success: true });
  });
});




app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
