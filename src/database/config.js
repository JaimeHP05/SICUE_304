const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta de la base de datos
const dbPath = path.join(__dirname, '..', '..', 'data', 'sicue.db');

// Crear directorio si no existe
const dbDir = path.dirname(dbPath);
!fs.existsSync(dbDir) && fs.mkdirSync(dbDir, { recursive: true });

// Configuración de la base de datos con mejor rendimiento
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) throw new Error('Error de conexión a la base de datos');
    
    // Optimizar configuración de SQLite
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 1000000');
    db.run('PRAGMA temp_store = MEMORY');
});

module.exports = db;
