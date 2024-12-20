# Sistema SICUE - Universidad de Córdoba

## Descripción
Sistema de gestión de intercambios universitarios y convalidaciones para la Universidad de Córdoba. Permite la gestión de convenios entre universidades, solicitudes de convalidación para estudiantes y solicitudes de intercambio para profesores.

## Características
- Panel de administración para gestión de convenios
- Panel de estudiantes para solicitudes de convalidación
- Panel de profesores para solicitudes de intercambio
- Gestión de asignaturas y equivalencias
- Sistema de autenticación multiusuario
- Base de datos SQLite para persistencia
- API RESTful

## Requisitos Previos
- Node.js (v14 o superior)
- SQLite3
- npm

## Instalación

1. Clonar el repositorio:
git clone https://github.com/tu-usuario/sistema-sicue.git
cd sistema-sicue

2. Instalar dependencias:
npm install

3. Configurar la base de datos:
npm run setup-db

4. Iniciar el servidor:
npm start

- El servidor está disponible en:
http://localhost:3000

## Endpoints API

### Autenticación
- POST /api/login - Iniciar sesión
  - Body: { username, password }
  - Response: { success, id, username, tipo }
- POST /api/logout - Cerrar sesión
  - Response: { success }

### Convenios
- GET /api/convenios - Listar todos los convenios
  - Response: { success, convenios[] }
- POST /api/convenios - Crear nuevo convenio
  - Body: { uniDestino, asignaturas[{origen, destino}] }
  - Response: { success, convenioId }
- GET /api/convenios/:id - Obtener convenio específico
  - Response: { success, convenio }
- DELETE /api/convenios/:id - Eliminar convenio
  - Response: { success }
- GET /api/convenios/universidades - Obtener lista de universidades
  - Response: { success, universidades[] }

### Solicitudes
- GET /api/solicitudes - Obtener solicitudes del usuario actual
  - Response: { success, solicitudes[] }
- POST /api/solicitudes/convalidacion - Crear solicitud de convalidación
  - Body: { uniDestino, duracion }
  - Response: { success, solicitudId }
- POST /api/solicitudes/intercambio - Crear solicitud de intercambio
  - Body: { uniDestino, duracion }
  - Response: { success, solicitudId }
- PUT /api/solicitudes/:id/estado - Actualizar estado de solicitud (admin)
  - Body: { estado }
  - Response: { success }

## Códigos de Estado
- 200: Éxito
- 400: Error en la solicitud
- 401: No autorizado
- 403: Acceso prohibido
- 404: Recurso no encontrado
- 500: Error del servidor

## Formatos de Respuesta
Todas las respuestas siguen el formato:
```json
{
  "success": boolean,
  "mensaje": string (opcional),
  "data": object (opcional)
}

## Tipos de Usuario
- admin: Acceso total al sistema
  - Gestionar convenios
  - Aprobar/rechazar solicitudes
  - Ver todas las solicitudes
- student: Gestión de convalidaciones
  - Ver convenios disponibles
  - Solicitar convalidaciones
  - Ver estado de sus solicitudes
- teacher: Gestión de intercambios
  - Ver convenios disponibles
  - Solicitar intercambios
  - Ver estado de sus solicitudes

## Scripts Disponibles
- `npm start`: Inicia el servidor y configura la base de datos
- `npm run dev`: Inicia el servidor en modo desarrollo con hot-reload
- `npm run setup-db`: Inicializa/reinicia la base de datos
- `npm test`: Ejecuta las pruebas unitarias

## Tecnologías Utilizadas
- Node.js (v14+)
- Express.js para el servidor REST
- SQLite3 para la base de datos
- CORS para comunicación cross-origin
- Nodemon para desarrollo

## Estructura de Datos

### Usuarios
```json
{
  "id": "number",
  "username": "string",
  "password": "string",
  "tipo": "admin|student|teacher"
}

### Convenios
{
  "id": "number",
  "uniDestino": "string",
  "asignaturas": [
    {
      "origen": "string",
      "destino": "string"
    }
  ]
}

## Solicitudes
{
  "id": "number",
  "usuarioId": "number",
  "tipo": "convalidacion|intercambio",
  "uniDestino": "string",
  "duracion": "primer_cuatrimestre|segundo_cuatrimestre|curso_completo",
  "estado": "pendiente|aceptada|rechazada|anulada"
}

## Seguridad
- Autenticación requerida para todas las operaciones
- Validación de permisos por tipo de usuario
- Sanitización de inputs
- Manejo de errores estructurado
- Control de sesiones
- Protección contra inyección SQL
- Logs de actividad del sistema

## Manejo de Errores
Todas las respuestas de error siguen el formato:
```json
{
  "success": false,
  "mensaje": "Descripción del error",
  "codigo": "ERROR_CODE"
}