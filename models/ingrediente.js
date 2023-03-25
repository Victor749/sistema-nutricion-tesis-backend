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

const buscarIniciaPor = async (cadenaBusqueda, limite = 5) => {
    let params = {
        cadenaBusqueda: cadenaBusqueda,
        limite: limite
    }
    console.log(params)
    const validacion = await busquedaSchema.validarBusqueda(params)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'MATCH (i:Ingrediente) WHERE toUpper(i.descripcion) STARTS WITH toUpper($cadenaBusqueda)' +
                    'RETURN i ORDER BY i.descripcion LIMIT toInteger($limite)'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('i').properties)
}

module.exports = {
    encontrarTodos,
    encontrarPorId,
    buscarIniciaPor
};
