const conexionNeo4j = require('../connection/conexionNeo4j');
const Neo4jError =  require('neo4j-driver-core/lib/error.js');
const usuarioSchema = require('../models/schemas/usuario');
const { v4: uuidv4 } = require('uuid');

const encontrarTodos = async () => {
    let sentencia = `MATCH (u:Usuario) RETURN u`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('u').properties)
}

const encontrarPorId = async (usuarioID) => {
    let sentencia = `MATCH (u:Usuario {usuarioID : '${usuarioID}'}) RETURN u LIMIT 1`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
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
    const usuarioID = uuidv4()
    let sentencia = `CREATE (u:Usuario {usuarioID : '${usuarioID}', nombre: '${usuario.nombre}',` +
                    `apellido: '${usuario.apellido}', email: '${usuario.email}', sexo: '${usuario.sexo}',` +
                    `anio_nacimiento: toInteger(${usuario.anio_nacimiento}), peso: toInteger(${usuario.peso}),` +
                    `estatura: toInteger(${usuario.estatura}), actividad_fisica: '${usuario.actividad_fisica}'}) RETURN u`
   try {
        const resultado = await conexionNeo4j.ejecutarCypher(sentencia) 
        return resultado.records[0].get('u').properties
    }
    catch (error) {
        if (error instanceof Neo4jError.Neo4jError && error.toString().includes('already exists with label')) {
            return json = {
                error: 'Ya existe un usuario con el email especificado.',
                codigo: 400
            }
        }
    }
    
}

const actualizar = async (usuarioID, usuario) => {
    const validacion = await usuarioSchema.validarUsuario(usuario)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = `MATCH (u:Usuario {usuarioID : '${usuarioID}'}) SET u.nombre = '${usuario.nombre}',` +
                    `u.apellido = '${usuario.apellido}', u.email = '${usuario.email}', u.sexo = '${usuario.sexo}',` +
                    `u.anio_nacimiento = toInteger(${usuario.anio_nacimiento}), u.peso = toInteger(${usuario.peso}),` +
                    `u.estatura = toInteger(${usuario.estatura}), u.actividad_fisica = '${usuario.actividad_fisica}' RETURN u`
    try {
        const resultado = await conexionNeo4j.ejecutarCypher(sentencia) 
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
                error: 'Ya existe un usuario con el email especificado.',
                codigo: 400
            }
        }
    }
}

const eliminar = async (usuarioID) => {
    let sentencia = `MATCH (u:Usuario {usuarioID : '${usuarioID}'}) DETACH DELETE u`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
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
    crear,
    actualizar,
    eliminar
};
   