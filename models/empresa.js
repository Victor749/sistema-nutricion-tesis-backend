const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (e:Empresa) RETURN e'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('e').properties)
}

const encontrarPorId = async (empresaID) => {
    let sentencia = 'MATCH (e:Empresa {empresaID : toInteger($empresaID)}) RETURN e LIMIT 1'
    let params = {empresaID: empresaID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('e').properties
    } else {
        return json = {
            error: 'Empresa no encontrada.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId
};
