const conexionNeo4j = require('../connection/conexionNeo4j');
const restriccionesCategoriasSchema = require('./schemas/restriccionesCategorias');

const verRestriccionesCategorias = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(c:Categoria) ' +
                    'RETURN r, c ORDER BY c.nombre'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        categoriaID: record.get('c').properties.categoriaID,
        nombre: record.get('c').properties.nombre,
        tipo: record.get('r').properties.tipo
    })
}

const agregarRestriccionesCategorias = async (usuarioID, restricciones) => {
    const validacion = await restriccionesCategoriasSchema.validarRestriccionesCategorias(restricciones)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'UNWIND $restriccionesCategorias as restriccion ' +
                    'MATCH (u:Usuario {usuarioID: $usuarioID}), ' +
                    '(c:Categoria {categoriaID: restriccion.categoriaID}) ' +
                    'MERGE (u)-[r:RESTRINGE]->(c) ' +
                    'ON CREATE SET r.tipo = restriccion.tipo ' +
                    'ON MATCH SET r.tipo = restriccion.tipo ' +
                    'RETURN r, c'
    let params = restricciones
    params.usuarioID = usuarioID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        categoriaID: record.get('c').properties.categoriaID,
        nombre: record.get('c').properties.nombre,
        tipo: record.get('r').properties.tipo
    })
}

const quitarRestriccionCategoria = async (usuarioID, categoriaID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    '(c:Categoria {categoriaID: toInteger($categoriaID)})' +
                    'DELETE r'
    let params = {}
    params.usuarioID = usuarioID
    params.categoriaID = categoriaID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 'Restricción quitada con éxito.'
    } else {
        return json = {
            error: 'Restricción, usuario y/o categoría no encontrado(s).',
            codigo: 404
        }
    }
}

module.exports = {
    verRestriccionesCategorias,
    agregarRestriccionesCategorias,
    quitarRestriccionCategoria
};
