const db = require('../database/config.js');

class Solicitud {
    constructor(id, usuarioId, uniDestino, duracion, estado = 'pendiente') {
        this.id = id;
        this.usuarioId = usuarioId;
        this.uniDestino = uniDestino;
        this.duracion = duracion;
        this.estado = estado;
    }

    static async obtenerPorUsuario(usuarioId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DISTINCT
                    s.id,
                    s.tipo,
                    s.uniDestino,
                    s.duracion,
                    s.estado,
                    s.fechaCreacion,
                    CASE 
                        WHEN s.tipo = 'convalidacion' 
                        THEN GROUP_CONCAT(DISTINCT ac.asignaturaOrigen || ' → ' || ac.asignaturaDestino) 
                        ELSE NULL 
                    END as asignaturas
                FROM solicitudes s
                LEFT JOIN convenios c ON s.uniDestino = c.uniDestino AND s.tipo = 'convalidacion'
                LEFT JOIN asignaturas_convenio ac ON c.id = ac.convenioId
                WHERE s.usuarioId = ?
                GROUP BY s.id, s.tipo, s.uniDestino, s.duracion, s.estado, s.fechaCreacion
                ORDER BY s.fechaCreacion DESC`;

            db.all(query, [usuarioId], (err, rows) => {
                if (err) return reject(err);

                const solicitudes = rows.map(row => ({
                    id: row.id,
                    tipo: row.tipo,
                    uniDestino: row.uniDestino,
                    duracion: row.duracion,
                    estado: row.estado,
                    fechaCreacion: row.fechaCreacion,
                    asignaturas: row.asignaturas ? row.asignaturas.split(',') : []
                }));

                resolve(solicitudes);
            });
        });
    }

    static async actualizarEstado(id, estado) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE solicitudes SET estado = ? WHERE id = ?',
                [estado, id],
                (err) => err ? reject(err) : resolve(true)
            );
        });
    }

    static getDuracionValida(duracion) {
        const duracionesValidas = [
            'primer_cuatrimestre',
            'segundo_cuatrimestre',
            'curso_completo'
        ];
        return duracionesValidas.includes(duracion) ? duracion : null;
    }
}

class Convalidacion extends Solicitud {
    constructor(id, usuarioId, uniDestino, duracion, asignaturas = [], estado = 'pendiente') {
        super(id, usuarioId, uniDestino, duracion, estado);
        this.tipo = 'convalidacion';
        this.asignaturas = asignaturas;
    }

    static async crear(usuarioId, uniDestino, duracion) {
        return new Promise((resolve, reject) => {
            if (!uniDestino || !Solicitud.getDuracionValida(duracion)) {
                return reject(new Error('Datos de convalidación inválidos'));
            }

            db.run(
                'INSERT INTO solicitudes (usuarioId, tipo, uniDestino, duracion, estado) VALUES (?, ?, ?, ?, ?)',
                [usuarioId, 'convalidacion', uniDestino, duracion, 'pendiente'],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async obtenerAsignaturas(solicitudId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT ac.asignaturaOrigen, ac.asignaturaDestino
                FROM solicitudes s
                JOIN convenios c ON s.uniDestino = c.uniDestino
                JOIN asignaturas_convenio ac ON c.id = ac.convenioId
                WHERE s.id = ? AND s.tipo = 'convalidacion'`,
                [solicitudId],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });
    }
}

class Intercambio extends Solicitud {
    constructor(id, usuarioId, uniDestino, duracion, estado = 'pendiente') {
        super(id, usuarioId, uniDestino, duracion, estado);
        this.tipo = 'intercambio';
    }

    static async crear(usuarioId, uniDestino, duracion) {
        return new Promise((resolve, reject) => {
            if (!uniDestino || !Solicitud.getDuracionValida(duracion)) {
                return reject(new Error('Datos de intercambio inválidos'));
            }

            db.run(
                'INSERT INTO solicitudes (usuarioId, tipo, uniDestino, duracion, estado) VALUES (?, ?, ?, ?, ?)',
                [usuarioId, 'intercambio', uniDestino, duracion, 'pendiente'],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }
}

module.exports = { Solicitud, Convalidacion, Intercambio };
