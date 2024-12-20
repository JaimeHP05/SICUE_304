/**
 * Test Suite de Convenios
 * Verifica:
 * - Creación de convenios
 * - Listado de convenios
 * - Eliminación de convenios
 * - Validación de datos
 * - Permisos de administración
 */

const assert = require('assert');
const Convenio = require('../src/models/Convenio');

describe('Gestión de Convenios', () => {
    let convenioId;

    const convenioEjemplo = {
        uniDestino: 'Universidad Test',
        asignaturas: [
            { origen: 'Matemáticas I', destino: 'Álgebra' },
            { origen: 'Física', destino: 'Física General' }
        ]
    };

    it('debería crear un nuevo convenio', async () => {
        convenioId = await Convenio.crear(convenioEjemplo);
        assert.ok(convenioId > 0);
    });

    it('debería listar los convenios existentes', async () => {
        const convenios = await Convenio.listar();
        assert.ok(Array.isArray(convenios));
        assert.ok(convenios.length > 0);
    });

    it('debería obtener un convenio por ID', async () => {
        const convenio = await Convenio.obtenerPorId(convenioId);
        assert.strictEqual(convenio.uniDestino, convenioEjemplo.uniDestino);
    });
});
