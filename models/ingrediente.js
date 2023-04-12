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
    // Regex que busca la cadena de busqueda dentro de un nombre o descripcion (case insensitive)
    params.cadenaBusquedaRegexExp = '(?i).*' + cadenaBusqueda + '.*'
    // La busqueda consiste en buscar nombres o descripciones que cumplan el regex anterior
    // Los resultados se ordenan en funcion de la posicion de aparicion de la cadena de busqueda y luego en orden alfabetico
    // Se usa SKIP y LIMIT para paginacion (el limite da el tamanio de pagina)
    let sentencia = 'MATCH (i:Ingrediente) WHERE i.descripcion =~ $cadenaBusquedaRegexExp RETURN i ' +
                    'ORDER BY apoc.text.indexOf(TOUPPER(i.descripcion), TOUPPER($cadenaBusqueda)), i.descripcion ' +
                    'SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('i').properties)
}

module.exports = {
    encontrarTodos,
    encontrarPorId,
    buscar
};
