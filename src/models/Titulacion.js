const db = require('../database/config');

class Titulacion {
    constructor(id, nombre, centroId, duracion, creditos, nivel) {
        this.id = id;
        this.nombre = nombre;
        this.centroId = centroId;
        this.duracion = duracion;
        this.creditos = creditos;
        this.nivel = nivel;
    }

    static async obtenerPorCentro(centroId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM titulaciones WHERE centroId = ?',
                [centroId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map(row => new Titulacion(
                        row.id,
                        row.nombre,
                        row.centroId,
                        row.duracion,
                        row.creditos,
                        row.nivel
                    )));
                }
            );
        });
    }

    async obtenerAsignaturas() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM asignaturas WHERE titulacionId = ?',
                [this.id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

module.exports = Titulacion;
