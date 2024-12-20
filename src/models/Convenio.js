const db = require('../database/config.js');

class Convenio {
    constructor(id, uniDestino, asignaturas) {
        this.id = id;
        this.uniDestino = uniDestino;
        this.asignaturas = asignaturas;
    }

    static async crear(convenioData) {
        console.log('Datos recibidos en crear:', convenioData); // Debug

        // Validaciones
        if (!convenioData.uniDestino) {
            throw new Error('Universidad destino es requerida');
        }
        if (!Array.isArray(convenioData.asignaturas) || convenioData.asignaturas.length === 0) {
            throw new Error('Debe incluir al menos un par de asignaturas');
        }

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    'INSERT INTO convenios (uniDestino) VALUES (?)',
                    [convenioData.uniDestino],
                    function(err) {
                        if (err) {
                            console.error('Error al crear convenio:', err);
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        const convenioId = this.lastID;
                        const stmt = db.prepare(
                            'INSERT INTO asignaturas_convenio (convenioId, asignaturaOrigen, asignaturaDestino) VALUES (?, ?, ?)'
                        );

                        let error = null;
                        convenioData.asignaturas.forEach(asig => {
                            stmt.run([convenioId, asig.origen, asig.destino], (err) => {
                                if (err) error = err;
                            });
                        });

                        stmt.finalize(err => {
                            if (err || error) {
                                console.error('Error al insertar asignaturas:', err || error);
                                db.run('ROLLBACK');
                                return reject(err || error);
                            }

                            db.run('COMMIT', err => {
                                if (err) {
                                    console.error('Error al hacer commit:', err);
                                    db.run('ROLLBACK');
                                    return reject(err);
                                }
                                resolve(convenioId);
                            });
                        });
                    }
                );
            });
        });
    }

    static async listar() {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT c.*, ac.asignaturaOrigen, ac.asignaturaDestino 
                FROM convenios c 
                LEFT JOIN asignaturas_convenio ac ON c.id = ac.convenioId`, 
                [], 
                (err, rows) => {
                    if (err) reject(err);
                    resolve(this.procesarResultados(rows));
                });
        });
    }

    static async obtenerPorId(id) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT c.*, ac.asignaturaOrigen, ac.asignaturaDestino 
                FROM convenios c 
                LEFT JOIN asignaturas_convenio ac ON c.id = ac.convenioId
                WHERE c.id = ?`, 
                [id], 
                (err, rows) => {
                    if (err) reject(err);
                    if (!rows || rows.length === 0) resolve(null);
                    const resultados = this.procesarResultados(rows);
                    resolve(resultados[0]); // Cambiado para devolver el objeto directamente
                });
        });
    }

    static async actualizar(id, datos) {
        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    console.error('Error al iniciar transacción:', err);
                    return reject(err);
                }

                db.run('UPDATE convenios SET uniDestino = ? WHERE id = ?',
                    [datos.uniDestino, id],
                    (err) => {
                        if (err) {
                            console.error('Error al actualizar convenio:', err);
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        db.run('DELETE FROM asignaturas_convenio WHERE convenioId = ?', [id], (err) => {
                            if (err) {
                                console.error('Error al eliminar asignaturas:', err);
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            const stmt = db.prepare(`INSERT INTO asignaturas_convenio 
                                (convenioId, asignaturaOrigen, asignaturaDestino) VALUES (?, ?, ?)`);

                            try {
                                datos.asignaturas.forEach(asig => {
                                    stmt.run([id, asig.origen, asig.destino], (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                });
                                stmt.finalize((err) => {
                                    if (err) {
                                        console.error('Error al finalizar statement:', err);
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }
                                    db.run('COMMIT', (err) => {
                                        if (err) {
                                            console.error('Error al hacer commit:', err);
                                            db.run('ROLLBACK');
                                            return reject(err);
                                        }
                                        resolve(true);
                                    });
                                });
                            } catch (error) {
                                console.error('Error al insertar asignaturas:', error);
                                db.run('ROLLBACK');
                                reject(error);
                            }
                        });
                    });
            });
        });
    }

    static async eliminar(id) {
        return new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) {
                    console.error('Error al iniciar transacción:', err);
                    return reject(err);
                }

                db.run('DELETE FROM asignaturas_convenio WHERE convenioId = ?', [id], (err) => {
                    if (err) {
                        console.error('Error al eliminar asignaturas:', err);
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    db.run('DELETE FROM convenios WHERE id = ?', [id], (err) => {
                        if (err) {
                            console.error('Error al eliminar convenio:', err);
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error al hacer commit:', err);
                                db.run('ROLLBACK');
                                return reject(err);
                            }
                            resolve(true);
                        });
                    });
                });
            });
        });
    }

    static async obtenerUniversidades() {
        return new Promise((resolve, reject) => {
            db.all('SELECT DISTINCT uniDestino FROM convenios', [], (err, rows) => {
                if (err) {
                    console.error('Error al obtener universidades:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static procesarResultados(rows) {
        const convenios = new Map();
        rows.forEach(row => {
            if (!row) return; // Protección contra registros nulos
            
            if (!convenios.has(row.id)) {
                convenios.set(row.id, {
                    id: row.id,
                    uniDestino: row.uniDestino,
                    asignaturas: []
                });
            }
            if (row.asignaturaOrigen) {
                convenios.get(row.id).asignaturas.push({
                    origen: row.asignaturaOrigen,
                    destino: row.asignaturaDestino
                });
            }
        });
        return Array.from(convenios.values());
    }
}

module.exports = Convenio;
