const conexionNeo4j = require('../connection/conexionNeo4j');
const Neo4jError =  require('neo4j-driver-core/lib/error.js');
const usuarioSchema = require('../models/schemas/usuario');

// --- INICIO ---  Funciones para calculo de metricas fisicas y de riesgo de DMT2 de usuarios ---

const calcularIMC = async (peso, estatura) => { // Indice de masa corporal
    const estatura_en_metros = (estatura / 100).toFixed(2) 
    const imc = peso / (estatura_en_metros * estatura_en_metros)
    return imc.toFixed(1)
}

const calcularFINDRISC = async (usuario) => { // Finnish Diabetes Risk Score
    let findrisc = 0
    // Pregunta edad
    const edad = parseInt(new Date().getFullYear()) - usuario.anio_nacimiento
    findrisc += edad < 45 ? 0 : edad >= 45 && edad <= 54 ? 2 : edad >= 55 && edad <= 64 ? 3 : 4
    // Pregunta IMC
    findrisc += usuario.imc < 25 ? 0 : usuario.imc >= 25 && usuario.imc <= 30 ? 1 : 3
    // Pregunta perimetro cintura
    if (usuario.sexo === 'Hombre') {
        findrisc += usuario.cintura < 94 ? 0 : usuario.cintura >= 94 && usuario.cintura <= 102 ? 3 : 4
    } else { // Mujer
        findrisc += usuario.cintura < 80 ? 0 : usuario.cintura >= 80 && usuario.cintura <= 88 ? 3 : 4
    }
    // Pregunta actividad fisica
    findrisc += usuario.actividad_fisica_diaria === 'Sí' ? 0 : 2
    // Pregunta frutas, verduras, cereales
    findrisc += usuario.frecuencia_consumo_frutas_verduras_cereales === 'Cada día' ? 0 : 1
    // Pregunta medicacion hipertension
    findrisc += usuario.medicacion_hipertension === 'No' ? 0 : 2
    // Pregunta alta glucosa
    findrisc += usuario.alta_glucosa === 'No' ? 0 : 5
     // Pregunta familiar con diabetes
    findrisc += usuario.familiar_con_diabetes === 'No' ? 0 : usuario.familiar_con_diabetes === 'Sí: abuelos, tía, tío o primo hermano' ? 3 : 5
    return findrisc
}

// --- FIN ---  Funciones para calculo de metricas fisicas y de riesgo de DMT2 de usuarios ---

const encontrarTodos = async () => {
    let sentencia = 'MATCH (u:Usuario) RETURN u'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('u').properties)
}

const encontrarPorId = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID : $usuarioID}) RETURN u LIMIT 1'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('u').properties
    } else {
        return json = {
            error: 'Usuario no encontrado.',
            codigo: 404
        }
    }
}

const encontrarPorEmail = async (email) => {
    let sentencia = 'MATCH (u:Usuario {email : $email}) RETURN u LIMIT 1'
    let params = {email: email}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('u').properties
    } else {
        return json = {
            error: 'Usuario no encontrado.',
            codigo: 404
        }
    }
}

const crear = async (usuario) => {
    const validacion = await usuarioSchema.validarUsuario(usuario)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'CREATE (u:Usuario {usuarioID : $usuarioID, nombre: $nombre,' +
                    'apellido: $apellido, email: $email, sexo: $sexo,' +
                    'anio_nacimiento: toInteger($anio_nacimiento), peso: toInteger($peso),' +
                    'estatura: toInteger($estatura), cintura: toInteger($cintura),' +
                    'imc: toFloat($imc), findrisc: toInteger($findrisc),' +
                    'actividad_fisica_diaria: $actividad_fisica_diaria, nivel_actividad_fisica: $nivel_actividad_fisica,' +
                    'frecuencia_consumo_frutas_verduras_cereales: $frecuencia_consumo_frutas_verduras_cereales,' +
                    'medicacion_hipertension: $medicacion_hipertension, alta_glucosa: $alta_glucosa,' +
                    'familiar_con_diabetes: $familiar_con_diabetes}) RETURN u'
    usuario.imc = await calcularIMC(usuario.peso, usuario.estatura)
    usuario.findrisc = await calcularFINDRISC(usuario)
    let params = usuario
    try {
        const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params) 
        return resultado.records[0].get('u').properties
    }
    catch (error) {
        if (error instanceof Neo4jError.Neo4jError && error.toString().includes('already exists with label')) {
            return json = {
                error: 'Ya existe un usuario con el email especificado: ' + usuario.email.toString(),
                codigo: 400
            }
        } else {
            throw error
        }
    }
    
}

const actualizar = async (usuarioID, usuario) => {
    usuario.usuarioID = usuarioID
    const validacion = await usuarioSchema.validarUsuario(usuario)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'MATCH (u:Usuario {usuarioID : $usuarioID}) SET u.nombre = $nombre,' +
                    'u.apellido = $apellido, u.email = $email, u.sexo = $sexo,' +
                    'u.anio_nacimiento = toInteger($anio_nacimiento), u.peso = toInteger($peso),' +
                    'u.estatura = toInteger($estatura), u.cintura = toInteger($cintura),' +
                    'u.imc = toFloat($imc), u.findrisc = toInteger($findrisc),' +
                    'u.actividad_fisica_diaria = $actividad_fisica_diaria, u.nivel_actividad_fisica = $nivel_actividad_fisica,' +
                    'u.frecuencia_consumo_frutas_verduras_cereales = $frecuencia_consumo_frutas_verduras_cereales,' +
                    'u.medicacion_hipertension = $medicacion_hipertension, u.alta_glucosa = $alta_glucosa,' +
                    'u.familiar_con_diabetes = $familiar_con_diabetes RETURN u'
    usuario.imc = await calcularIMC(usuario.peso, usuario.estatura)
    usuario.findrisc = await calcularFINDRISC(usuario)
    let params = usuario
    try {
        const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params) 
        if (resultado.records[0]) {
            return resultado.records[0].get('u').properties
        } else {
            return json = {
                error: 'Usuario no encontrado.',
                codigo: 404
            }
        }
    }
    catch (error) {
        if (error instanceof Neo4jError.Neo4jError && error.toString().includes('already exists with label')) {
            return json = {
                error: 'Ya existe un usuario con el email especificado: ' + usuario.email.toString(),
                codigo: 400
            }
        } else {
            throw error
        }
    }
}

const eliminar = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID : $usuarioID}) REMOVE u:Usuario SET u:UsuarioEliminado'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.labelsAdded && resultado.summary.counters._stats.labelsRemoved) {
        return 'Usuario eliminado con éxito.'
    } else {
        return json = {
            error: 'Usuario no encontrado.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId,
    encontrarPorEmail,
    crear,
    actualizar,
    eliminar
};
   