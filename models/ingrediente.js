const conexionNeo4j = require('../connection/conexionNeo4j');
const busquedaSchema = require('../models/schemas/busqueda');

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

const buscar = async (cadenaBusqueda, limite = 10, pagina = 1) => {
    let params = {
        cadenaBusqueda: cadenaBusqueda,
        limite: limite,
        pagina: pagina
    }
    const validacion = await busquedaSchema.validarBusqueda(params)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    // Se hace un trim de la cadena de busqueda para quitar espacios no deseados
    params.cadenaBusqueda = cadenaBusqueda.trim()
    // La busqueda consiste en buscar nombres o descripciones con la libreria de busqueda inteligente Apache Lucene
    // Se usa SKIP y LIMIT para paginacion (el limite da el tamanio de pagina)
    let sentencia = "CALL db.index.fulltext.queryNodes('nombresIngredientes', $cadenaBusqueda) YIELD node as i RETURN i " +
                    'SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('i').properties)
}

module.exports = {
    encontrarTodos,
    encontrarPorId,
    buscar
};
