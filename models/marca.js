const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (m:Marca) RETURN m'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('m').properties)
}

const encontrarPorId = async (marcaID) => {
    let sentencia = 'MATCH (m:Marca {marcaID : toInteger($marcaID)})' +
                    'OPTIONAL MATCH (m)-[:PERTENECE]->(e:Empresa) RETURN m, e LIMIT 1'
    let params = {marcaID: marcaID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        let marca = resultado.records[0].get('m').properties
        marca.empresa = resultado.records[0].get('e') ? resultado.records[0].get('e').properties : {}
        return marca
    } else {
        return json = {
            error: 'Marca no encontrada.',
            codigo: 404
        }
    }
}

const encontrarPorEmpresa = async (empresaID) => {
    let sentencia = 'MATCH (m:Marca)-[r:PERTENECE]->(e:Empresa {empresaID : toInteger($empresaID)}) RETURN m'
    let params = {empresaID: empresaID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('m').properties)
}

module.exports = {
    encontrarTodos,
    encontrarPorId,
    encontrarPorEmpresa
};
