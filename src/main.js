const { Usuario } = require('./models/Usuario');
const { Solicitud, Convalidacion, Intercambio } = require('./models/Solicitud');
const Convenio = require('./models/Convenio');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/setupDb');
const { validarSolicitud } = require('./utils/validators');
const app = express();

const logger = {
    log: (message) => console.log(`[${new Date().toISOString()}] ${message}`),
    error: (message) => console.error(`[${new Date().toISOString()}] ERROR: ${message}`)
};

let usuarioActual = null;

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta específica para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas API mejoradas
app.post('/api/login', async (req, res) => {
    logger.log(`Intento de inicio de sesión: ${req.body.username}`);
    try {
        const usuario = await Usuario.login(req.body.username, req.body.password);
        logger.log('Respuesta login:', JSON.stringify(usuario));

        if (usuario && usuario.success) {
            usuarioActual = {
                id: usuario.id,
                username: usuario.username,
                tipo: usuario.tipo
            };
            logger.log('Usuario actual establecido:', JSON.stringify(usuarioActual));
            
            // Asegurarnos de que la respuesta incluya todos los datos necesarios
            res.json({
                success: true,
                id: usuario.id,
                username: usuario.username,
                tipo: usuario.tipo,
                mensaje: 'Login exitoso'
            });
        } else {
            logger.error(`Login fallido para usuario: ${req.body.username}`);
            res.status(401).json({
                success: false,
                mensaje: usuario.mensaje || 'Credenciales inválidas'
            });
        }
    } catch (error) {
        logger.error(`Error en login: ${error.stack}`);
        res.status(500).json({
            success: false,
            mensaje: 'Error en el servidor: ' + error.message
        });
    }
});

app.post('/api/logout', (req, res) => {
    usuarioActual = null;
    res.json({ success: true });
});

app.post('/api/convenios', async (req, res) => {
    try {
        if (!usuarioActual || usuarioActual.tipo !== 'admin') {
            return res.status(403).json({ success: false, mensaje: 'No autorizado' });
        }
        const convenioId = await Convenio.crear(req.body);
        const convenios = await Convenio.listar(); // Obtener lista actualizada
        res.json({ success: true, convenioId, convenios });
    } catch (error) {
        logger.error('Error creando convenio:', error);
        res.status(500).json({ 
            success: false, 
            mensaje: error.message || 'Error al crear convenio' 
        });
    }
});

app.get('/api/convenios', async (req, res) => {
    try {
        const convenios = await Convenio.listar();
        res.json({ success: true, convenios });
    } catch (error) {
        logger.error('Error listando convenios:', error);
        res.status(500).json({ success: false, mensaje: 'Error al obtener convenios' });
    }
});

app.get('/api/convenios/universidades', async (req, res) => {
    try {
        const universidades = await Convenio.obtenerUniversidades();
        res.json({ success: true, universidades });
    } catch (error) {
        logger.error('Error obteniendo universidades:', error);
        res.status(500).json({ success: false, mensaje: 'Error al obtener universidades' });
    }
});

app.get('/api/convenios/:id', async (req, res) => {
    try {
        const convenio = await Convenio.obtenerPorId(req.params.id);
        if (convenio) {
            // Asegurar que las asignaturas estén incluidas en la respuesta
            res.json({ 
                success: true, 
                convenio: {
                    id: convenio.id,
                    uniDestino: convenio.uniDestino,
                    asignaturas: convenio.asignaturas || []
                }
            });
        } else {
            res.status(404).json({ success: false, mensaje: 'Convenio no encontrado' });
        }
    } catch (error) {
        logger.error('Error obteniendo convenio:', error);
        res.status(500).json({ success: false, mensaje: 'Error al obtener convenio' });
    }
});

app.delete('/api/convenios/:id', async (req, res) => {
    try {
        if (!usuarioActual || usuarioActual.tipo !== 'admin') {
            return res.status(403).json({ success: false, mensaje: 'No autorizado' });
        }
        await Convenio.eliminar(req.params.id);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error eliminando convenio:', error);
        res.status(500).json({ success: false, mensaje: 'Error al eliminar convenio' });
    }
});

app.post('/api/solicitudes/convalidacion', async (req, res) => {
    try {
        if (!usuarioActual || usuarioActual.tipo !== 'student') {
            return res.status(403).json({ success: false, mensaje: 'No autorizado' });
        }

        const { uniDestino, duracion } = req.body;
        if (!uniDestino || !duracion) {
            return res.status(400).json({
                success: false,
                mensaje: 'La universidad destino y duración son requeridas'
            });
        }

        // Verificar si ya existe una solicitud pendiente para el mismo convenio
        const solicitudesExistentes = await Solicitud.obtenerPorUsuario(usuarioActual.id);
        const solicitudDuplicada = solicitudesExistentes.find(s => 
            s.uniDestino === uniDestino && 
            s.tipo === 'convalidacion' &&
            s.estado === 'pendiente'
        );

        if (solicitudDuplicada) {
            return res.status(400).json({
                success: false,
                mensaje: 'Ya existe una solicitud pendiente para esta universidad y período'
            });
        }

        // Crear solicitud usando la clase Convalidacion
        const solicitudId = await Convalidacion.crear(usuarioActual.id, uniDestino, duracion);
        const solicitudesActualizadas = await Solicitud.obtenerPorUsuario(usuarioActual.id);

        return res.json({
            success: true,
            mensaje: 'Solicitud de convalidación creada exitosamente',
            solicitudId,
            solicitudes: solicitudesActualizadas
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mensaje: error.message || 'Error al procesar la solicitud'
        });
    }
});

app.post('/api/solicitudes/intercambio', async (req, res) => {
    try {
        if (!usuarioActual || usuarioActual.tipo !== 'teacher') {
            return res.status(403).json({ success: false, mensaje: 'No autorizado' });
        }

        const { uniDestino, duracion } = req.body;
        if (!uniDestino || !duracion) {
            return res.status(400).json({
                success: false,
                mensaje: 'La universidad destino y duración son requeridas'
            });
        }

        // Verificar si ya existe una solicitud pendiente para el mismo convenio
        const solicitudesExistentes = await Solicitud.obtenerPorUsuario(usuarioActual.id);
        const solicitudDuplicada = solicitudesExistentes.find(s => 
            s.uniDestino === uniDestino && 
            s.tipo === 'intercambio' &&
            s.estado === 'pendiente'
        );

        if (solicitudDuplicada) {
            return res.status(400).json({
                success: false,
                mensaje: 'Ya existe una solicitud pendiente para esta universidad y período'
            });
        }

        // Crear solicitud usando la clase Intercambio
        const solicitudId = await Intercambio.crear(usuarioActual.id, uniDestino, duracion);
        const solicitudesActualizadas = await Solicitud.obtenerPorUsuario(usuarioActual.id);

        return res.json({
            success: true,
            mensaje: 'Solicitud de intercambio creada exitosamente',
            solicitudId,
            solicitudes: solicitudesActualizadas
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mensaje: error.message || 'Error al crear solicitud'
        });
    }
});

app.get('/api/solicitudes', async (req, res) => {
    try {
        if (!usuarioActual) {
            return res.status(403).json({ success: false, mensaje: 'No autorizado' });
        }
        const solicitudes = await Solicitud.obtenerPorUsuario(usuarioActual.id);
        return res.json({ success: true, solicitudes });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            mensaje: 'Error al obtener solicitudes' 
        });
    }
});

app.put('/api/solicitudes/:id/estado', async (req, res) => {
    try {
        if (!usuarioActual || usuarioActual.tipo !== 'admin') {
            return res.status(403).json({ success: false, mensaje: 'No autorizado' });
        }
        
        await Solicitud.actualizarEstado(req.params.id, req.body.estado);
        res.json({ success: true });
    } catch (error) {
        logger.error('Error actualizando estado:', error);
        res.status(500).json({ success: false, mensaje: 'Error al actualizar estado' });
    }
});

// Manejo de errores
app.use((req, res) => {
    logger.log(`404: ${req.url}`);
    res.status(404).json({ success: false, mensaje: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor' });
});

// Iniciar servidor solo después de inicializar la base de datos
async function startServer() {
    try {
        await initializeDatabase();
        console.log('Base de datos inicializada correctamente');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.log(`Servidor iniciado en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
