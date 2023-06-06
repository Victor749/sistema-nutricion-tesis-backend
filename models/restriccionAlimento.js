const conexionNeo4j = require('../connection/conexionNeo4j');
const restriccionAlimentoSchema = require('./schemas/restriccionAlimento');
const restriccionesAlimentosSchema = require('./schemas/restriccionesAlimentos');

const verRestriccionesAlimento = async (usuarioID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(a:Alimento) ' +
                    'RETURN r, a ORDER BY a.nombre'
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        alimentoID: record.get('a').properties.alimentoID,
        nombre: record.get('a').properties.nombre,
        tipo: record.get('r').properties.tipo
    })
}

const agregarRestriccionAlimento = async (usuarioID, alimentoID, restriccion) => {
    const validacion = await restriccionAlimentoSchema.validarRestriccionAlimento(restriccion)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID}),' +
                    '(a:Alimento {alimentoID: toInteger($alimentoID)})' +
                    'MERGE (u)-[r:RESTRINGE]->(a) ' +
                    'ON CREATE SET r.tipo = $tipo ' +
                    'ON MATCH SET r.tipo = $tipo ' +
                    'RETURN r, a'
    let params = restriccion
    params.usuarioID = usuarioID
    params.alimentoID = alimentoID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        return json = {
            alimentoID: resultado.records[0].get('a').properties.alimentoID,
            nombre: resultado.records[0].get('a').properties.nombre,
            tipo: resultado.records[0].get('r').properties.tipo
        }
    } else {
        return json = {
            error: 'Usuario y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

const reescribirRestriccionesAlimentos = async (usuarioID, restricciones) => {
    const validacion = await restriccionesAlimentosSchema.validarRestriccionesAlimentos(restricciones)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    let sentencia = 'CALL {MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->(a:Alimento) DELETE r}' +
                    'UNWIND $restriccionesAlimentos as restriccion ' +
                    'MATCH (u:Usuario {usuarioID: $usuarioID}), ' +
                    '(a:Alimento {alimentoID: restriccion.alimentoID}) ' +
                    'MERGE (u)-[r:RESTRINGE]->(a) ' +
                    'ON CREATE SET r.tipo = restriccion.tipo ' +
                    'ON MATCH SET r.tipo = restriccion.tipo ' +
                    'RETURN r, a'
    let params = restricciones
    params.usuarioID = usuarioID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        alimentoID: record.get('a').properties.alimentoID,
        nombre: record.get('a').properties.nombre,
        tipo: record.get('r').properties.tipo
    })
}

const quitarRestriccionAlimento = async (usuarioID, alimentoID) => {
    let sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE]->' +
                    '(a:Alimento {alimentoID: toInteger($alimentoID)})' +
                    'DELETE r'
    let params = {}
    params.usuarioID = usuarioID
    params.alimentoID = alimentoID
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.summary.counters._stats.relationshipsDeleted) {
        return 'Restricción quitada con éxito.'
    } else {
        return json = {
            error: 'Restricción, usuario y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

const contarRestriccionesAlimento = async (usuarioID) => {
    let sentencia = `CALL {
                        MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE {tipo: 'Alergia'}]->(a:Alimento) 
                        RETURN count(a) as alimentos_restringidos_por_alergia
                    }
                    CALL {
                        MATCH (u:Usuario {usuarioID: $usuarioID})-[r:RESTRINGE {tipo: 'Gusto'}]->(a:Alimento) 
                        RETURN count(a) as alimentos_restringidos_por_gusto
                    }
                    RETURN alimentos_restringidos_por_alergia, alimentos_restringidos_por_gusto`
    let params = {usuarioID: usuarioID}
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return {
        alimentos_restringidos_por_alergia: resultado.records[0].get('alimentos_restringidos_por_alergia'),
        alimentos_restringidos_por_gusto: resultado.records[0].get('alimentos_restringidos_por_gusto') 
    }
}

module.exports = {
    verRestriccionesAlimento,
    agregarRestriccionAlimento, 
    reescribirRestriccionesAlimentos,
    quitarRestriccionAlimento,
    contarRestriccionesAlimento
};
