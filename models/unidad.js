const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (u:Unidad) RETURN u'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('u').properties)
}

const encontrarPorId = async (unidadID) => {
    let sentencia = 'MATCH (u:Unidad {unidadID : toInteger($unidadID)}) RETURN u LIMIT 1'
    let params = {unidadID: unidadID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('u').properties
    } else {
        return json = {
            error: 'Unidad no encontrada.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId
};
