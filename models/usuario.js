const conexionNeo4j = require('../connection/conexionNeo4j');
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
        return 404
    }
}

const crear = async (usuario) => {
    const usuarioID = uuidv4()
    let sentencia = `CREATE (u:Usuario {usuarioID : '${usuarioID}', nombre: '${usuario.nombre}',` +
                    `apellido: '${usuario.apellido}', email: '${usuario.email}', sexo: '${usuario.sexo}',` +
                    `fecha_nacimiento: '${usuario.fecha_nacimiento}', peso: toInteger(${usuario.peso}),` +
                    `estatura: toInteger(${usuario.estatura}), actividad_fisica: '${usuario.actividad_fisica}'}) RETURN u`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records[0].get('u').properties
}

const actualizar = async (usuarioID, usuario) => {
    let sentencia = `MATCH (u:Usuario {usuarioID : '${usuarioID}'}) SET u.nombre = '${usuario.nombre}',` +
                    `u.apellido = '${usuario.apellido}', u.email = '${usuario.email}', u.sexo = '${usuario.sexo}',` +
                    `u.fecha_nacimiento = '${usuario.fecha_nacimiento}', u.peso = toInteger(${usuario.peso}),` +
                    `u.estatura = toInteger(${usuario.estatura}), u.actividad_fisica = '${usuario.actividad_fisica}' RETURN u`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.records[0]) {
        return resultado.records[0].get('u').properties
    } else {
        return 404
    }
}

const eliminar = async (usuarioID) => {
    let sentencia = `MATCH (u:Usuario {usuarioID : '${usuarioID}'}) DETACH DELETE u`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.summary.counters._stats.nodesDeleted) {
        return 200
    } else {
        return 404
    }
}

const verRestriccionesAlimento = async (usuarioID) => {
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'})-[r:RESTRINGE]-(a:Alimento) RETURN r, a`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => json = {
        alimentoID: record.get('a').properties.alimentoID,
        nombre: record.get('a').properties.nombre,
        tipo: record.get('r').properties.tipo
    })
}

const agregarRestriccionAlimento = async (usuarioID, restriccionAlimento) => {
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'}),` +
                    `(a:Alimento {alimentoID: toInteger(${restriccionAlimento.alimentoID})})` +
                    `MERGE (u)-[r:RESTRINGE {tipo: '${restriccionAlimento.tipo}'}]->(a) RETURN r, a`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.records.length) {
        return json = {
            alimentoID: resultado.records[0].get('a').properties.alimentoID,
            nombre: resultado.records[0].get('a').properties.nombre,
            tipo: resultado.records[0].get('r').properties.tipo
        }
    } else {
        return 404
    }
}

const quitarRestriccionAlimento = async (usuarioID, restriccionAlimento) => {
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'})-[r:RESTRINGE {tipo: '${restriccionAlimento.tipo}'}]->` +
                    `(a:Alimento {alimentoID: toInteger(${restriccionAlimento.alimentoID})})` +
                    `DELETE r`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 200
    } else {
        return 404
    }
}

const verRestriccionesIngrediente = async (usuarioID) => {
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'})-[r:RESTRINGE]-(i:Ingrediente) RETURN r, i`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => json = {
        ingredienteID: record.get('i').properties.ingredienteID,
        descripcion: record.get('i').properties.descripcion,
        tipo: record.get('r').properties.tipo
    })
}

const agregarRestriccionIngrediente = async (usuarioID, restriccionIngrediente) => {
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'}),` +
                    `(i:Ingrediente {ingredienteID: toInteger(${restriccionIngrediente.ingredienteID})})` +
                    `MERGE (u)-[r:RESTRINGE {tipo: '${restriccionIngrediente.tipo}'}]->(i) RETURN r, i`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.records.length) {
        return json = {
            ingredienteID: resultado.records[0].get('i').properties.ingredienteID,
            descripcion: resultado.records[0].get('i').properties.descripcion,
            tipo: resultado.records[0].get('r').properties.tipo
        }
    } else {
        return 404
    }
}

const quitarRestriccionIngrediente = async (usuarioID, restriccionIngrediente) => {
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'})-[r:RESTRINGE {tipo: '${restriccionIngrediente.tipo}'}]->` +
                    `(i:Ingrediente {ingredienteID: toInteger(${restriccionIngrediente.ingredienteID})})` +
                    `DELETE r`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 200
    } else {
        return 404
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId,
    crear,
    actualizar,
    eliminar,
    verRestriccionesAlimento,
    agregarRestriccionAlimento, 
    quitarRestriccionAlimento,
    verRestriccionesIngrediente,
    agregarRestriccionIngrediente,
    quitarRestriccionIngrediente
};
   