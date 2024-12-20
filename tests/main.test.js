/**
 * Test Suite Principal
 * Verifica la funcionalidad básica del sistema y la conexión a la base de datos
 */

const assert = require('assert');
const { initializeDatabase } = require('../src/database/setupDb');
const db = require('../src/database/config');

describe('Sistema SICUE - Tests Principales', () => {
    before(async () => {
        // Inicializar BD de pruebas
        await initializeDatabase();
    });

    describe('Conexión Base de Datos', () => {
        it('debería conectar correctamente a la base de datos', (done) => {
            db.get('SELECT 1', (err, result) => {
                assert.strictEqual(err, null);
                assert.strictEqual(result['1'], 1);
                done();
            });
        });
    });
});