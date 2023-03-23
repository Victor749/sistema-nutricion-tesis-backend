const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (n:Nutriente) RETURN n'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('n').properties)
}

const encontrarPorId = async (nutrienteID) => {
    let sentencia = 'MATCH (n:Nutriente {nutrienteID : toInteger($nutrienteID)}) RETURN n LIMIT 1'
    let params = {nutrienteID: nutrienteID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('n').properties
    } else {
        return json = {
            error: 'Nutriente no encontrado.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId
};
