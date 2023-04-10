const conexionNeo4j = require('../connection/conexionNeo4j');
const { v4: uuidv4 } = require('uuid');
const solicitudSustitucionSchema = require('../models/schemas/solicitudSustitucion');
const juicioSugerenciaSchema = require('../models/schemas/juicioSugerencia');

/*const mapeoDeCategorias = {
    38: [29, 39]
}*/

const solicitarSustitucion = async (usuarioID, alimentoID, flexible = 'false') => {
    const validacion = await solicitudSustitucionSchema.validarSolicitudSustitucion({flexible: flexible})
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }

    let resultado = {}
    const transaccion = await conexionNeo4j.transaccionCypher()

    try {
        const sustitucionID = uuidv4()
        const sentencia_sustitucion = "CREATE (s:Sustitucion {sustitucionID: $sustitucionID, fecha_hora: toString(datetime({timezone: 'America/Guayaquil'}))})" +
                                      "RETURN s"
        const params_sustitucion = {sustitucionID: sustitucionID}
        const resultado_sustitucion = await transaccion.txc.run(sentencia_sustitucion, params_sustitucion)
        resultado = resultado_sustitucion.records[0].get('s').properties
    
        const sentencia_usuario = 'MATCH (u:Usuario {usuarioID: $usuarioID}), (s:Sustitucion {sustitucionID: $sustitucionID})' +
                                  'CREATE (u)-[r:REALIZA]->(s) RETURN u'
        const params_usuario = {usuarioID: usuarioID, sustitucionID: sustitucionID}
        const resultado_usuario = await transaccion.txc.run(sentencia_usuario, params_usuario)
        if (resultado_usuario.summary.counters._stats.relationshipsCreated) {
            resultado.usuario = resultado_usuario.records[0].get('u').properties
        } else {
            await transaccion.txc.rollback()
            return json = {
                error: 'Usuario no encontrado.',
                codigo: 404
            }
        }

        const sentencia_alimento = 'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)}), (s:Sustitucion {sustitucionID: $sustitucionID})' +
                                   'CREATE (s)-[r:REEMPLAZA]->(a) RETURN a'
        const params_alimento = {alimentoID: alimentoID, sustitucionID: sustitucionID}
        const resultado_alimento = await transaccion.txc.run(sentencia_alimento, params_alimento)
        if (resultado_alimento.summary.counters._stats.relationshipsCreated) {
            resultado.reemplazo = resultado_alimento.records[0].get('a').properties
        } else {
            await transaccion.txc.rollback()
            return json = {
                error: 'Alimento no encontrado.',
                codigo: 404
            }
        }

        let sentencia_sugerencias = 'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)})-[r:DISTA]->(a2:Alimento),' + 
                                    '(u:Usuario {usuarioID: $usuarioID})' +
                                    'WHERE '

        // Si una solicitud de sustitucion es flexible no se consideran las restricciones de gusto del usuario                             
        if (flexible === 'true') {
            sentencia_sugerencias += "NOT (u)-[:RESTRINGE {tipo: 'Alergia'}]->(a2) AND " +                      
                                     "NOT (u)-[:RESTRINGE {tipo: 'Alergia'}]->(:Ingrediente)<-[:CONTIENE]-(a2) "
        } else {
            sentencia_sugerencias += 'NOT (u)-[:RESTRINGE]->(a2) AND ' +
                                     'NOT (u)-[:RESTRINGE]->(:Ingrediente)<-[:CONTIENE]-(a2) '
        }    

        sentencia_sugerencias += 'RETURN a2 ORDER BY r.distancia'
        const params_sugerencias = {alimentoID: alimentoID, usuarioID: usuarioID}
        const resultado_sugerencias = await transaccion.txc.run(sentencia_sugerencias, params_sugerencias)
        resultado.sugerencias = resultado_sugerencias.records.map(record => record.get('a2').properties)

        await transaccion.txc.commit()
        return resultado
    } catch (error) {
        await transaccion.txc.rollback()
        throw error
    } finally {
        transaccion.session.close()
    }
}

const juzgarSugerencia = async (sustitucionID, alimentoID, juicio) => {
    const validacion = await juicioSugerenciaSchema.validarJuicioSugerencia(juicio)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }

    let resultado = {}

    const sentencia = "MATCH (a:Alimento {alimentoID: toInteger($alimentoID)}), (s:Sustitucion {sustitucionID: $sustitucionID})" +
                      "CREATE (s)-[r:SUGIERE {fecha_hora: toString(datetime({timezone: 'America/Guayaquil'})), aceptado: toBoolean($aceptado)}]->(a)" +
                      "RETURN s, r, a"
    const params = {alimentoID: alimentoID, sustitucionID: sustitucionID, aceptado: juicio.aceptado}
    const resultado_sentencia = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado_sentencia.summary.counters._stats.relationshipsCreated) {
        resultado = resultado_sentencia.records[0].get('r').properties
        resultado.sustitucion = resultado_sentencia.records[0].get('s').properties
        resultado.sugerencia = resultado_sentencia.records[0].get('a').properties
        return resultado
    } else {
        return json = {
            error: 'Sustitución y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

module.exports = {
    solicitarSustitucion,
    juzgarSugerencia
};
