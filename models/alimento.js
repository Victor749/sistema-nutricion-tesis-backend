const conexionNeo4j = require('../connection/conexionNeo4j');
const busquedaSchema = require('../models/schemas/busqueda');
const filtroSchema = require('../models/schemas/filtro');

const encontrarTodos = async () => {
    let sentencia = 'MATCH (a:Alimento) RETURN a'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
    return resultado.records.map(record => record.get('a').properties)
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
    let sentencia = 'MATCH (a:Alimento) WHERE a.nombre =~ $cadenaBusquedaRegexExp RETURN a ' +
                    'ORDER BY apoc.text.indexOf(TOUPPER(a.nombre), TOUPPER($cadenaBusqueda)), a.nombre ' +
                    'SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('a').properties)
}

const filtrarYOrdenar = async (filtro, valorFiltro, orden, ordenSentido, limite = 10, pagina = 1) => {
    let params = {
        filtro: filtro,
        valorFiltro: valorFiltro,
        orden: orden,
        ordenSentido: ordenSentido,
        limite: limite,
        pagina: pagina
    }
    const validacion = await filtroSchema.validarFiltro(params)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'MATCH (a:Alimento)'
    if (params.filtro) {sentencia += 'WHERE a.' + `${params.filtro}` +  ' = toInteger($valorFiltro)'}
    sentencia += 'RETURN a '
    if (params.orden) {sentencia += 'ORDER BY a.' + `${params.orden} ${params.ordenSentido} `}
    sentencia += 'SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('a').properties)
}

// --- INICIO --- Funciones internas para obtener informacion completa de un alimento por ID ---

const obtenerIngredientes = async (alimentoID) => {
    let sentencia = 'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)})-[r:CONTIENE]->(i:Ingrediente) RETURN i'
    let params = {alimentoID: alimentoID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('i').properties)
}

const obtenerNutrientes = async (alimentoID) => {
    let sentencia = 'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)})-[r1:TIENE]->(n:Nutriente)' +
                    '-[r2:SE_MIDE_POR]->(u:Unidad) RETURN r1, n, u'
    let params = {alimentoID: alimentoID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
            nutriente: record.get('n').properties,
            contenido: record.get('r1').properties,
            unidad: record.get('u').properties
        }
    )
}

// --- FIN --- Funciones internas para obtener informacion completa de un alimento por ID ---

const encontrarPorId = async (alimentoID) => {
    let sentencia = 'MATCH (a:Alimento {alimentoID : toInteger($alimentoID)})' +
                    'OPTIONAL MATCH (a)-[r1:INTEGRA]->(c:Categoria)' +
                    'OPTIONAL MATCH (a)-[r2:CORRESPONDE]->(m:Marca)' +
                    'OPTIONAL MATCH (a)-[r3:CORRESPONDE]->(m)-[r4:PERTENECE]->(e:Empresa)' +
                    'OPTIONAL MATCH (a)-[r5:MIDE_TAMANO_ENVASE_POR]->(ue:Unidad)' +
                    'OPTIONAL MATCH (a)-[r6:MIDE_TAMANO_PORCION_POR]->(up:Unidad)' +
                    'RETURN a, c, m, e, ue, up LIMIT 1'
    let params = {alimentoID: alimentoID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        let alimento = resultado.records[0].get('a').properties
        alimento.categoria = resultado.records[0].get('c') ? resultado.records[0].get('c').properties : {}
        delete alimento.categoria_id
        alimento.marca = resultado.records[0].get('m') ? resultado.records[0].get('m').properties : {}
        delete alimento.marca_id
        alimento.empresa = resultado.records[0].get('e') ? resultado.records[0].get('e').properties : {}
        alimento.tam_envase_unidad = resultado.records[0].get('ue') ? resultado.records[0].get('ue').properties : {}
        delete alimento.tam_envase_unidad_id
        alimento.tam_porcion_unidad = resultado.records[0].get('up') ? resultado.records[0].get('up').properties : {}
        delete alimento.tam_porcion_unidad_id
        alimento.ingredientes = await obtenerIngredientes(alimentoID)
        alimento.nutrientes = await obtenerNutrientes(alimentoID)
        return alimento
    } else {
        return json = {
            error: 'Alimento no encontrado.',
            codigo: 404
        }
    }
}

module.exports = {
    encontrarTodos,
    buscar,
    filtrarYOrdenar,
    encontrarPorId
};
