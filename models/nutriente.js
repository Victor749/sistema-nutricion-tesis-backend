const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (n:Nutriente) RETURN n'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('n').properties)
}

const encontrarPorId = async (nutrienteID) => {
    let sentencia = 'MATCH (n:Nutriente {nutrienteID : toInteger($nutrienteID)})' +
                    'OPTIONAL MATCH (n)-[:SE_MIDE_POR]->(u:Unidad) RETURN n, u LIMIT 1'
    let params = {nutrienteID: nutrienteID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        let nutriente = resultado.records[0].get('n').properties
        nutriente.unidad = resultado.records[0].get('u') ? resultado.records[0].get('u').properties : {}
        return nutriente
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
