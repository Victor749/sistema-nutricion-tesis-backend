const conexionNeo4j = require('../connection/conexionNeo4j');
const restriccionIngredienteSchema = require('../models/schemas/restriccionIngrediente');

const verRestriccionesIngrediente = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(i:Ingrediente) ' +
                    'RETURN r, i ORDER BY i.descripcion'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
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
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID}),' +
                    '(i:Ingrediente {ingredienteID: toInteger($ingredienteID)})' +
                    'MERGE (u)-[r:RESTRINGE]->(i) ' +
                    'ON CREATE SET r.tipo = $tipo ' +
                    'RETURN r, i'
    let params = restriccionIngrediente
    params.usuarioID = usuarioID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        if (resultado.summary.counters._stats.relationshipsCreated) {
            return json = {
                ingredienteID: resultado.records[0].get('i').properties.ingredienteID,
                descripcion: resultado.records[0].get('i').properties.descripcion,
                tipo: resultado.records[0].get('r').properties.tipo
            }
        } else {
            return json = {
                error: 'Restricción ya existente para el usuario e ingrediente especificados.',
                codigo: 400
            }
        }
    } else {
        return json = {
            error: 'Usuario y/o ingrediente no encontrado(s).',
            codigo: 404
        }
    }
}

const quitarRestriccionIngrediente = async (usuarioID, ingredienteID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    '(i:Ingrediente {ingredienteID: toInteger($ingredienteID)})' +
                    'DELETE r'
    let params = {}
    params.usuarioID = usuarioID
    params.ingredienteID = ingredienteID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 'Restricción quitada con éxito.'
    } else {
        return json = {
            error: 'Restricción, usuario y/o ingrediente no encontrado(s).',
            codigo: 404
        }
    }
}

const verificarRestriccionIngrediente = async (usuarioID, ingredienteID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    '(i:Ingrediente {ingredienteID: toInteger($ingredienteID)})' +
                    'RETURN r, i'
    let params = {}
    params.usuarioID = usuarioID
    params.ingredienteID = ingredienteID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return json = {
            ingredienteID: resultado.records[0].get('i').properties.ingredienteID,
            descripcion: resultado.records[0].get('i').properties.descripcion,
            tipo: resultado.records[0].get('r').properties.tipo
        }
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
    quitarRestriccionIngrediente,
    verificarRestriccionIngrediente
};
