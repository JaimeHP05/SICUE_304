const db = require('../database/config');

class Centro {
    constructor(id, nombre, universidadId, direccion, tipo) {
        this.id = id;
        this.nombre = nombre;
        this.universidadId = universidadId;
        this.direccion = direccion;
        this.tipo = tipo;
    }

    static async obtenerPorUniversidad(universidadId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM centros WHERE universidadId = ?',
                [universidadId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map(row => new Centro(
                        row.id, 
                        row.nombre, 
                        row.universidadId,
                        row.direccion,
                        row.tipo
                    )));
                }
            );
        });
    }
}

module.exports = Centro;
