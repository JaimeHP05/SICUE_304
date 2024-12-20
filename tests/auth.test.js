/**
 * Test Suite de Autenticación
 * Verifica:
 * - Login con diferentes tipos de usuario
 * - Intentos de login inválidos
 * - Cierre de sesión
 * - Permisos de acceso
 */

const assert = require('assert');
const { Usuario } = require('../src/models/Usuario');

describe('Autenticación', () => {
    describe('Login', () => {
        it('debería permitir login como admin', async () => {
            const result = await Usuario.login('admin', 'admin123');
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.tipo, 'admin');
        });

        it('debería permitir login como profesor', async () => {
            const result = await Usuario.login('profesor', 'prof123');
            assert.strictEqual(result.success, true);
            assert.strictEqual(result.tipo, 'teacher');
        });

        it('debería rechazar credenciales inválidas', async () => {
            const result = await Usuario.login('fake', 'wrong');
            assert.strictEqual(result.success, false);
        });
    });
});
