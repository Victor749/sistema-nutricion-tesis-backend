const conexionNeo4j = require('../connection/conexionNeo4j');
const Neo4jError =  require('neo4j-driver-core/lib/error.js');
const usuarioSchema = require('../models/schemas/usuario');

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
                    'estatura: toInteger($estatura), actividad_fisica: $actividad_fisica}) RETURN u'
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
                    'u.estatura = toInteger($estatura), u.actividad_fisica = $actividad_fisica RETURN u'
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
    let sentencia = 'MATCH (u:Usuario {usuarioID : $usuarioID}) DETACH DELETE u'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.nodesDeleted) {
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
   