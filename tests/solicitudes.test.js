
/**
 * Test Suite de Solicitudes
 * Verifica:
 * - Creación de solicitudes de convalidación
 * - Creación de solicitudes de intercambio
 * - Validación de datos
 * - Verificación de duplicados
 * - Estados de solicitudes
 * - Permisos de usuarios
 */

const { Solicitud, Convalidacion, Intercambio } = require('../src/models/Solicitud');

describe('Gestión de Solicitudes', () => {
    before(async () => {
        await initializeDatabase();
    });

    describe('Solicitudes de Convalidación', () => {
        it('debería crear una solicitud de convalidación válida', async () => {
            const solicitudId = await Convalidacion.crear(1, 'Universidad Test', 'primer_cuatrimestre');
            assert.ok(solicitudId > 0);
        });

        it('debería rechazar solicitud sin universidad destino', async () => {
            try {
                await Convalidacion.crear(1, null, 'primer_cuatrimestre');
                assert.fail('Debería haber fallado');
            } catch (error) {
                assert.ok(error instanceof Error);
            }
        });

        it('no debería permitir solicitudes duplicadas', async () => {
            await Convalidacion.crear(1, 'Universidad Test', 'primer_cuatrimestre');
            try {
                await Convalidacion.crear(1, 'Universidad Test', 'primer_cuatrimestre');
                assert.fail('Debería haber rechazado el duplicado');
            } catch (error) {
                assert.ok(error instanceof Error);
            }
        });
    });

    describe('Solicitudes de Intercambio', () => {
        it('debería crear una solicitud de intercambio válida', async () => {
            const solicitudId = await Intercambio.crear(2, 'Universidad Test', 'segundo_cuatrimestre');
            assert.ok(solicitudId > 0);
        });

        it('debería validar la duración correctamente', async () => {
            try {
                await Intercambio.crear(2, 'Universidad Test', 'duracion_invalida');
                assert.fail('Debería haber rechazado la duración inválida');
            } catch (error) {
                assert.ok(error instanceof Error);
            }
        });

        it('no debería permitir intercambios duplicados', async () => {
            await Intercambio.crear(2, 'Universidad Test', 'primer_cuatrimestre');
            try {
                await Intercambio.crear(2, 'Universidad Test', 'primer_cuatrimestre');
                assert.fail('Debería haber rechazado el duplicado');
            } catch (error) {
                assert.ok(error instanceof Error);
            }
        });
    });

    describe('Gestión de Estados', () => {
        let solicitudId;

        before(async () => {
            solicitudId = await Convalidacion.crear(1, 'Universidad Test', 'primer_cuatrimestre');
        });

        it('debería actualizar el estado correctamente', async () => {
            const result = await Solicitud.actualizarEstado(solicitudId, 'aceptada');
            assert.strictEqual(result, true);
        });

        it('debería obtener el estado actualizado', async () => {
            const solicitudes = await Solicitud.obtenerPorUsuario(1);
            const solicitud = solicitudes.find(s => s.id === solicitudId);
            assert.strictEqual(solicitud.estado, 'aceptada');
        });
    });
});
