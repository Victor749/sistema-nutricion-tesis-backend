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
    // Se hace un trim de la cadena de busqueda para quitar espacios no deseados
    params.cadenaBusqueda = cadenaBusqueda.trim()
    // La busqueda consiste en buscar nombres o descripciones con la libreria de busqueda inteligente Apache Lucene
    // Se usa SKIP y LIMIT para paginacion (el limite da el tamanio de pagina)
    let sentencia = "CALL db.index.fulltext.queryNodes('nombresAlimentos', $cadenaBusqueda) YIELD node as a RETURN a " +
                    'SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('a').properties)
}

const filtrarYOrdenar = async (bodyFiltros, orden, ordenSentido, limite = 10, pagina = 1) => {
    let params = {
        filtros: bodyFiltros.filtros,
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
    if (params.filtros) {
        let array_filtros = params.filtros
        delete params.filtros
        array_filtros.forEach((filtro) => {
            params[filtro.tipo] = filtro.valores
        });
        sentencia += 'WHERE '
        array_filtros.forEach((filtro, indice, array_filtros) => {
            sentencia += `a.${filtro.tipo} IN $${filtro.tipo} `
            if (indice !== array_filtros.length - 1) {sentencia += ' AND '}
        });
    }
    sentencia += 'RETURN a '
    if (params.orden) {sentencia += `ORDER BY a.${params.orden} ${params.ordenSentido} `}
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

const encontrarPorId = async (usuarioID = '', alimentoID) => {
    let sentencia = 'MATCH (a:Alimento {alimentoID : toInteger($alimentoID)})' +
                    'OPTIONAL MATCH (a)-[r1:INTEGRA]->(c:Categoria)' +
                    'OPTIONAL MATCH (a)-[r2:CORRESPONDE]->(m:Marca)' +
                    'OPTIONAL MATCH (a)-[r3:CORRESPONDE]->(m)-[r4:PERTENECE]->(e:Empresa)' +
                    'OPTIONAL MATCH (a)-[r5:MIDE_TAMANO_ENVASE_POR]->(ue:Unidad)' +
                    'OPTIONAL MATCH (a)-[r6:MIDE_TAMANO_PORCION_POR]->(up:Unidad)' +
                    'OPTIONAL MATCH (a)<-[r7:RESTRINGE]->(u:Usuario {usuarioID: $usuarioID})' +
                    'RETURN a, c, m, e, ue, up, r7 LIMIT 1'
    let params = {usuarioID: usuarioID, alimentoID: alimentoID}
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
        alimento.restringido = resultado.records[0].get('r7') ? resultado.records[0].get('r7').properties : false
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
