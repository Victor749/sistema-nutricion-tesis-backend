const conexionNeo4j = require('../connection/conexionNeo4j');
const restriccionAlimentoSchema = require('../models/schemas/restriccionAlimento');

const verRestriccionesAlimento = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(a:Alimento) ' +
                    'RETURN r, a ORDER BY a.nombre'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        alimentoID: record.get('a').properties.alimentoID,
        nombre: record.get('a').properties.nombre,
        tipo: record.get('r').properties.tipo
    })
}

const agregarRestriccionAlimento = async (usuarioID, restriccionAlimento) => {
    const validacion = await restriccionAlimentoSchema.validarRestriccionAlimento(restriccionAlimento)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID}),' +
                    '(a:Alimento {alimentoID: toInteger($alimentoID)})' +
                    'MERGE (u)-[r:RESTRINGE]->(a) ' +
                    'ON CREATE SET r.tipo = $tipo ' +
                    'RETURN r, a'
    let params = restriccionAlimento
    params.usuarioID = usuarioID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        if (resultado.summary.counters._stats.relationshipsCreated) {
            return json = {
                alimentoID: resultado.records[0].get('a').properties.alimentoID,
                nombre: resultado.records[0].get('a').properties.nombre,
                tipo: resultado.records[0].get('r').properties.tipo
            }
        } else {
            return json = {
                error: 'Restricción ya existente para el usuario y alimento especificados.',
                codigo: 400
            }
        }
    } else {
        return json = {
            error: 'Usuario y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

const quitarRestriccionAlimento = async (usuarioID, alimentoID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    '(a:Alimento {alimentoID: toInteger($alimentoID)})' +
                    'DELETE r'
    let params = {}
    params.usuarioID = usuarioID
    params.alimentoID = alimentoID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 'Restricción quitada con éxito.'
    } else {
        return json = {
            error: 'Restricción, usuario y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

const verificarRestriccionAlimento = async (usuarioID, alimentoID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    '(a:Alimento {alimentoID: toInteger($alimentoID)})' +
                    'RETURN r, a'
    let params = {}
    params.usuarioID = usuarioID
    params.alimentoID = alimentoID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return json = {
            alimentoID: resultado.records[0].get('a').properties.alimentoID,
            nombre: resultado.records[0].get('a').properties.nombre,
            tipo: resultado.records[0].get('r').properties.tipo
        }
    } else {
        return json = {
            error: 'Restricción, usuario y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

module.exports = {
    verRestriccionesAlimento,
    agregarRestriccionAlimento, 
    quitarRestriccionAlimento,
    verificarRestriccionAlimento
};
