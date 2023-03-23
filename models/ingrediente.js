const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (i:Ingrediente) RETURN i'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('i').properties)
}

const encontrarPorId = async (ingredienteID) => {
    let sentencia = 'MATCH (i:Ingrediente {ingredienteID : toInteger($ingredienteID)}) RETURN i LIMIT 1'
    let params = {ingredienteID: ingredienteID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('i').properties
    } else {
        return json = {
            error: 'Ingrediente no encontrado.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId
};
