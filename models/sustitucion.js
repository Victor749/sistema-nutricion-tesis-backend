const conexionNeo4j = require('../connection/conexionNeo4j');
const { v4: uuidv4 } = require('uuid');

const solicitarSustitucion = async (usuarioID, alimentoID) => {
    let resultado = {}
    const transaccion = await conexionNeo4j.transaccionCypher()

    try {
        const sustitucionID = uuidv4()
        const ahora = new Date();
        const fecha_hora = ahora.getFullYear() + "/" + (ahora.getMonth() + 1) + "/" + ahora.getDate() + 
                           " " + ahora.getHours() + ":" + ahora.getMinutes() + ":" + ahora.getSeconds() 
                           + "." + ahora.getMilliseconds();
        const sentencia_sustitucion = 'CREATE (s:Sustitucion {sustitucionID: $sustitucionID, fecha_hora: $fecha_hora, ' +
                                      'num_intentos: toInteger(0)}) RETURN s'
        const params_sustitucion = {sustitucionID: sustitucionID, fecha_hora: fecha_hora}
        const resultado_sustitucion = await transaccion.txc.run(sentencia_sustitucion, params_sustitucion)
        resultado = resultado_sustitucion.records[0].get('s').properties
    
        const sentencia_usuario = 'MATCH (u:Usuario {usuarioID: $usuarioID}), (s:Sustitucion {sustitucionID: $sustitucionID})' +
                                  'CREATE (u)-[r:REALIZA]->(s) RETURN u'
        const params_usuario = {usuarioID: usuarioID, sustitucionID: sustitucionID}
        const resultado_usuario = await transaccion.txc.run(sentencia_usuario, params_usuario)
        if (resultado_usuario.summary.counters._stats.relationshipsCreated) {
            resultado.usuario = {
                usuarioID: resultado_usuario.records[0].get('u').properties.usuarioID,
                email: resultado_usuario.records[0].get('u').properties.email
            }
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
            resultado.reemplazo = {
                alimentoID: resultado_alimento.records[0].get('a').properties.alimentoID,
                nombre: resultado_alimento.records[0].get('a').properties.nombre
            }
        } else {
            await transaccion.txc.rollback()
            return json = {
                error: 'Alimento no encontrado.',
                codigo: 404
            }
        }

        /*WHERE NOT (u)-[:RESTRINGE {tipo: 'Alergia'}]->(a2) AND                       
        NOT (u)-[:RESTRINGE {tipo: 'Alergia'}]->(:Ingrediente)<-[:CONTIENE]-(a2)*/
        const sentencia_sugerencias = 'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)})-[r:DISTA]->(a2:Alimento),' + 
                                      '(u:Usuario {usuarioID: $usuarioID})' +
                                      'WHERE NOT (u)-[:RESTRINGE]->(a2) AND ' +
                                      'NOT (u)-[:RESTRINGE]->(:Ingrediente)<-[:CONTIENE]-(a2) ' +
                                      'RETURN a2 ORDER BY r.distancia'
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

module.exports = {
    solicitarSustitucion
};
