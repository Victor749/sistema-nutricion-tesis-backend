const conexionNeo4j = require('../connection/conexionNeo4j');
const restriccionIngredienteSchema = require('../models/schemas/restriccionIngrediente');

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
    const validacion = await restriccionIngredienteSchema.validarRestriccionIngrediente(restriccionIngrediente)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'}),` +
                    `(i:Ingrediente {ingredienteID: toInteger(${restriccionIngrediente.ingredienteID})})` +
                    `MERGE (u)-[r:RESTRINGE {tipo: '${restriccionIngrediente.tipo}'}]->(i) RETURN r, i`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.records[0]) {
        return json = {
            ingredienteID: resultado.records[0].get('i').properties.ingredienteID,
            descripcion: resultado.records[0].get('i').properties.descripcion,
            tipo: resultado.records[0].get('r').properties.tipo
        }
    } else {
        return json = {
            error: 'Usuario y/o ingrediente no encontrado(s).',
            codigo: 404
        }
    }
}

const quitarRestriccionIngrediente = async (usuarioID, restriccionIngrediente) => {
    const validacion = await restriccionIngredienteSchema.validarRestriccionIngrediente(restriccionIngrediente)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = `MATCH (u:Usuario {usuarioID: '${usuarioID}'})-[r:RESTRINGE {tipo: '${restriccionIngrediente.tipo}'}]->` +
                    `(i:Ingrediente {ingredienteID: toInteger(${restriccionIngrediente.ingredienteID})})` +
                    `DELETE r`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 'Restricción quitada con éxito.'
    } else {
        return json = {
            error: 'Restricción, usuario y/o ingrediente no encontrado(s).',
            codigo: 404
        }
    }
}

module.exports = {
    verRestriccionesIngrediente,
    agregarRestriccionIngrediente,
    quitarRestriccionIngrediente
};