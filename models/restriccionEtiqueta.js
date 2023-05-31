const conexionNeo4j = require('../connection/conexionNeo4j');
const restriccionesEtiquetasSchema = require('./schemas/restriccionesEtiquetas');

const verRestriccionesEtiquetas = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(e:Etiqueta) ' +
                    'RETURN r, e ORDER BY e.texto'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        busqueda: record.get('e').properties.busqueda,
        etiqueta: record.get('e').properties.texto,
        tipo: record.get('r').properties.tipo,
        numero_alimentos: record.get('e').properties.numero_alimentos,
        numero_ingredientes: record.get('e').properties.numero_ingredientes
    })
}

const verificarRestriccionesEtiquetas = async (restricciones) => {
    const validacion = await restriccionesEtiquetasSchema.validarRestriccionesEtiquetas(restricciones)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = `UNWIND $restriccionesEtiquetas as restriccion
                    CALL {
                        WITH restriccion
                        RETURN TOUPPER(apoc.text.join(apoc.text.split(TRIM(restriccion.texto), ' +'), ' ')) as texto,
                        TOUPPER(apoc.text.join(apoc.text.split(TRIM(restriccion.texto), ' +'), ' AND ')) as busqueda,
                        restriccion.tipo as tipo
                    }
                    CALL { 
                        WITH busqueda 
                        CALL db.index.fulltext.queryNodes('nombresAlimentos', busqueda) YIELD node as a
                        RETURN COUNT(a) as numero_alimentos
                    }
                    CALL { 
                        WITH busqueda
                        CALL db.index.fulltext.queryNodes('nombresIngredientes', busqueda) YIELD node as i 
                        RETURN COUNT(i) as numero_ingredientes
                    }
                    CALL {
                        WITH texto, busqueda, tipo, numero_alimentos, numero_ingredientes
                        WITH texto, busqueda, tipo, numero_alimentos, numero_ingredientes
                        RETURN {texto: texto, busqueda: busqueda, numero_alimentos: numero_alimentos, numero_ingredientes: numero_ingredientes} as e
                    }
                    RETURN e`
    let params = restricciones
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        busqueda: record.get('e').busqueda,
        etiqueta: record.get('e').texto,
        tipo: record.get('e').tipo,
        numero_alimentos: record.get('e').numero_alimentos,
        numero_ingredientes: record.get('e').numero_ingredientes
    })
}

const agregarRestriccionesEtiquetas = async (usuarioID, restricciones) => {
    const validacion = await restriccionesEtiquetasSchema.validarRestriccionesEtiquetas(restricciones)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = `UNWIND $restriccionesEtiquetas as restriccion
                    CALL {
                        WITH restriccion
                        RETURN TOUPPER(apoc.text.join(apoc.text.split(TRIM(restriccion.texto), ' +'), ' ')) as texto,
                        TOUPPER(apoc.text.join(apoc.text.split(TRIM(restriccion.texto), ' +'), ' AND ')) as busqueda,
                        restriccion.tipo as tipo
                    }
                    CALL { 
                        WITH busqueda 
                        CALL db.index.fulltext.queryNodes('nombresAlimentos', busqueda) YIELD node as a
                        RETURN COUNT(a) as numero_alimentos
                    }
                    CALL { 
                        WITH busqueda
                        CALL db.index.fulltext.queryNodes('nombresIngredientes', busqueda) YIELD node as i 
                        RETURN COUNT(i) as numero_ingredientes
                    }
                    CALL {
                        WITH texto, busqueda, tipo, numero_alimentos, numero_ingredientes
                        WITH texto, busqueda, tipo, numero_alimentos, numero_ingredientes
                        WHERE numero_alimentos + numero_ingredientes > 0
                        MATCH (u:Usuario {usuarioID: $usuarioID})
                        MERGE (e:Etiqueta {texto: texto, busqueda: busqueda})
                        ON CREATE SET e.numero_alimentos = numero_alimentos,  e.numero_ingredientes = numero_ingredientes 
                        ON MATCH SET e.numero_alimentos = numero_alimentos,  e.numero_ingredientes = numero_ingredientes 
                        MERGE (u)-[r:RESTRINGE]->(e) 
                        ON CREATE SET r.tipo = tipo
                        ON MATCH SET r.tipo = tipo
                        RETURN r, e
                    }
                    RETURN r, e`
    let params = restricciones
    params.usuarioID = usuarioID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        busqueda: record.get('e').properties.busqueda,
        etiqueta: record.get('e').properties.texto,
        tipo: record.get('r').properties.tipo,
        numero_alimentos: record.get('e').properties.numero_alimentos,
        numero_ingredientes: record.get('e').properties.numero_ingredientes
    })
}

const reescribirRestriccionesEtiquetas = async (usuarioID, restricciones) => {
    const validacion = await restriccionesEtiquetasSchema.validarRestriccionesEtiquetas(restricciones)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = `
                    CALL {
                        MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(e:Etiqueta) DELETE r
                    }
                    UNWIND $restriccionesEtiquetas as restriccion
                    CALL {
                        WITH restriccion
                        RETURN TOUPPER(apoc.text.join(apoc.text.split(TRIM(restriccion.texto), ' +'), ' ')) as texto,
                        TOUPPER(apoc.text.join(apoc.text.split(TRIM(restriccion.texto), ' +'), ' AND ')) as busqueda,
                        restriccion.tipo as tipo
                    }
                    CALL { 
                        WITH busqueda 
                        CALL db.index.fulltext.queryNodes('nombresAlimentos', busqueda) YIELD node as a
                        RETURN COUNT(a) as numero_alimentos
                    }
                    CALL { 
                        WITH busqueda
                        CALL db.index.fulltext.queryNodes('nombresIngredientes', busqueda) YIELD node as i 
                        RETURN COUNT(i) as numero_ingredientes
                    }
                    CALL {
                        WITH texto, busqueda, tipo, numero_alimentos, numero_ingredientes
                        WITH texto, busqueda, tipo, numero_alimentos, numero_ingredientes
                        WHERE numero_alimentos + numero_ingredientes > 0
                        MATCH (u:Usuario {usuarioID: $usuarioID})
                        MERGE (e:Etiqueta {texto: texto, busqueda: busqueda})
                        ON CREATE SET e.numero_alimentos = numero_alimentos,  e.numero_ingredientes = numero_ingredientes 
                        ON MATCH SET e.numero_alimentos = numero_alimentos,  e.numero_ingredientes = numero_ingredientes 
                        MERGE (u)-[r:RESTRINGE]->(e) 
                        ON CREATE SET r.tipo = tipo
                        ON MATCH SET r.tipo = tipo
                        RETURN r, e
                    }
                    RETURN r, e`
    let params = restricciones
    params.usuarioID = usuarioID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        busqueda: record.get('e').properties.busqueda,
        etiqueta: record.get('e').properties.texto,
        tipo: record.get('r').properties.tipo,
        numero_alimentos: record.get('e').properties.numero_alimentos,
        numero_ingredientes: record.get('e').properties.numero_ingredientes
    })
}

const quitarRestriccionEtiqueta = async (usuarioID, etiqueta) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    "(e:Etiqueta {texto: TOUPPER(apoc.text.join(apoc.text.split(TRIM($etiqueta), ' +'), ' '))})" +
                    'DELETE r'
    let params = {}
    params.usuarioID = usuarioID
    params.etiqueta = etiqueta
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 'Restricción quitada con éxito.'
    } else {
        return json = {
            error: 'Restricción, usuario y/o etiqueta no encontrado(s).',
            codigo: 404
        }
    }
}

module.exports = {
    verRestriccionesEtiquetas,
    verificarRestriccionesEtiquetas,
    agregarRestriccionesEtiquetas,
    reescribirRestriccionesEtiquetas,
    quitarRestriccionEtiqueta
};
