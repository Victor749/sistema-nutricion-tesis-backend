const conexionNeo4j = require('../connection/conexionNeo4j');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (c:Categoria) RETURN c'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('c').properties)
}

const encontrarPorId = async (categoriaID) => {
    let sentencia = 'MATCH (c:Categoria {categoriaID : toInteger($categoriaID)}) RETURN c LIMIT 1'
    let params = {categoriaID: categoriaID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return resultado.records[0].get('c').properties
    } else {
        return json = {
            error: 'Categoría no encontrada.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    encontrarPorId
};
