const validarSolicitud = (solicitud) => {
    if (!solicitud.uniDestino) {
        throw new Error('Universidad destino es requerida');
    }

    if (!solicitud.duracion || 
        !['primer_cuatrimestre', 'segundo_cuatrimestre', 'curso_completo'].includes(solicitud.duracion)) {
        throw new Error('Debe seleccionar una duración válida');
    }

    return true;
};

const validarConvenio = (convenio) => {
    if (!convenio.uniDestino) {
        throw new Error('Universidad destino es requerida');
    }
    if (!convenio.asignaturas || !convenio.asignaturas.length) {
        throw new Error('Debe incluir al menos una asignatura');
    }
    return true;
};

// Añadir constantes aquí en lugar de importarlas
const DURACION_TIPOS = {
    PRIMER_CUATRIMESTRE: 'primer_cuatrimestre',
    SEGUNDO_CUATRIMESTRE: 'segundo_cuatrimestre',
    CURSO_COMPLETO: 'curso_completo'
};

const DURACION_LABELS = {
    [DURACION_TIPOS.PRIMER_CUATRIMESTRE]: 'Primer cuatrimestre',
    [DURACION_TIPOS.SEGUNDO_CUATRIMESTRE]: 'Segundo cuatrimestre',
    [DURACION_TIPOS.CURSO_COMPLETO]: 'Curso completo'
};

module.exports = {
    validarSolicitud,
    validarConvenio,
    DURACION_TIPOS,
    DURACION_LABELS
};
