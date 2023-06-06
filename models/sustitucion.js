const conexionNeo4j = require('../connection/conexionNeo4j');
const { v4: uuidv4 } = require('uuid');
const solicitudSustitucionSchema = require('../models/schemas/solicitudSustitucion');
const juicioSugerenciaSchema = require('../models/schemas/juicioSugerencia');
const historialSustitucionesSchema = require('../models/schemas/historialSustituciones');
const RecomendacionGeneral = require('../models/recomendacionGeneral');
const RecomendacionAlimenticia = require('../models/recomendacionAlimenticia');

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
        const sentencia_sustitucion = "CREATE (s:Sustitucion {sustitucionID: $sustitucionID, fecha_hora: toString(datetime({timezone: 'America/Guayaquil'})), flexible: $flexible})" +
                                      "RETURN s"
        const params_sustitucion = {sustitucionID: sustitucionID, flexible: flexible}
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

        let restriccion = "[:RESTRINGE]"
        // Si una solicitud de sustitucion es flexible no se consideran las restricciones de gusto del usuario                             
        if (flexible === 'true') {
            restriccion = "[:RESTRINGE {tipo: 'Alergia'}]"
        } 

        let sentencia_sugerencias = `CALL {
                                        MATCH (usuario:Usuario {usuarioID: $usuarioID})-` + restriccion + `->(e:Etiqueta) RETURN apoc.text.join(collect('(' + e.busqueda + ')'), ' OR ') as etiquetas
                                    }
                                    CALL { 
                                        WITH etiquetas
                                        WITH etiquetas
                                        WHERE etiquetas <> ""
                                        CALL db.index.fulltext.queryNodes('nombresAlimentos', etiquetas) YIELD node as alimento
                                        RETURN collect(alimento.nombre) as alimentos_restringidos
                                    }
                                    CALL { 
                                        WITH etiquetas
                                        WITH etiquetas
                                        WHERE etiquetas <> ""
                                        CALL db.index.fulltext.queryNodes('nombresIngredientes', etiquetas) YIELD node as ingrediente
                                        RETURN collect(ingrediente.descripcion) as ingredientes_restringidos
                                    }
                                    MATCH (u:Usuario {usuarioID: $usuarioID}), (a:Alimento {alimentoID: toInteger($alimentoID)})-[r:DISTA]->(a2:Alimento)
                                    WHERE NOT a2.nombre IN alimentos_restringidos AND
                                    NOT (u)-` + restriccion + `->(a2) AND
                                    NOT (u)-` + restriccion + `->(:Categoria)<-[:INTEGRA]-(a2)
                                    WITH r, a2, ingredientes_restringidos
                                    OPTIONAL MATCH p=(a2)-[:CONTIENE]->(i:Ingrediente WHERE i.descripcion IN ingredientes_restringidos)
                                    WITH r, a2, size(collect(p)) as num_ingredientes_restringidos
                                    MATCH (a2) WHERE num_ingredientes_restringidos = 0
                                    RETURN a2 ORDER BY r.distancia`

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

const juzgarSugerencia = async (usuarioID, sustitucionID, alimentoID, juicio) => {
    const validacion = await juicioSugerenciaSchema.validarJuicioSugerencia(juicio)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }

    let resultado = {}

    let sentencia = "MATCH (u:Usuario {usuarioID: $usuarioID})-[r:REALIZA]->(s:Sustitucion {sustitucionID: $sustitucionID}), (a:Alimento {alimentoID: toInteger($alimentoID)})"             
    const params = {usuarioID: usuarioID, alimentoID: alimentoID, sustitucionID: sustitucionID, aceptado: juicio.aceptado}
    if (juicio.aceptado === "true") {
        const recomendaciones = await RecomendacionGeneral.obtenerRecomendacionesGenerales(usuarioID)
        const recomendaciones_alimenticias = await RecomendacionAlimenticia.obtenerRecomendacionesAlimenticias(alimentoID)
        recomendaciones.push(...recomendaciones_alimenticias)
        const mensaje_recomendacion = recomendaciones.join('\n')
        params.mensaje_recomendacion = mensaje_recomendacion
        params.aporte_nutricional = juicio.aporte_nutricional
        sentencia += "CREATE (s)-[r1:SUGIERE {fecha_hora: toString(datetime({timezone: 'America/Guayaquil'})), aceptado: toBoolean($aceptado), mensaje_recomendacion: $mensaje_recomendacion, " + 
                     "aporte_nutricional: $aporte_nutricional}]->(a)"
    } else {
        sentencia += "CREATE (s)-[r1:SUGIERE {fecha_hora: toString(datetime({timezone: 'America/Guayaquil'})), aceptado: toBoolean($aceptado)}]->(a)"
    }
    sentencia += "RETURN s, r1, a"

    const resultado_sentencia = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado_sentencia.summary.counters._stats.relationshipsCreated) {
        resultado = resultado_sentencia.records[0].get('r1').properties
        resultado.sustitucion = resultado_sentencia.records[0].get('s').properties
        resultado.sugerencia = resultado_sentencia.records[0].get('a').properties
        return resultado
    } else {
        return json = {
            error: 'Usuario, sustitución y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

const historialSustituciones = async (usuarioID, fecha, limite = 5, pagina = 1) => {
    let params = {
        fecha: fecha,
        limite: limite,
        pagina: pagina
    }
    const validacion = await historialSustitucionesSchema.validarHistorialSustituciones(params)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    params.usuarioID = usuarioID
    let sentencia = `MATCH (u:Usuario {usuarioID: $usuarioID})-[:REALIZA]->(s:Sustitucion) WHERE s.fecha_hora STARTS WITH $fecha
                    WITH s ORDER BY s.fecha_hora DESC 
                    SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)
                    CALL {
                        WITH s
                        MATCH (s)-[:REEMPLAZA]->(reemplazo:Alimento) RETURN reemplazo
                    }
                    CALL {
                        WITH s
                        MATCH (s)-[r:SUGIERE]->(sugerencia:Alimento) WITH r, sugerencia ORDER BY r.fecha_hora ASC
                        RETURN collect({info: r, alimento: sugerencia}) as sugerencias
                    }
                    RETURN {sustitucion: s, reemplazo: reemplazo, sugerencias: sugerencias} as historial`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => json = {
        sustitucion: record.get('historial').sustitucion.properties,
        reemplazo: record.get('historial').reemplazo.properties,
        sugerencias: record.get('historial').sugerencias.map(sugerencia => json = {
            info: sugerencia.info.properties, 
            alimento: sugerencia.alimento.properties
        })
    })
}

const cuentaSustitucionesExitosasHoy = async (usuarioID) => {
    let params = {usuarioID: usuarioID}
    let sentencia = `MATCH (:Usuario {usuarioID: $usuarioID})-[:REALIZA]->(s:Sustitucion)-[r:SUGIERE {aceptado: true}]->(:Alimento) 
                    WHERE r.fecha_hora STARTS WITH toString(date(datetime({timezone: 'America/Guayaquil'}))) WITH DISTINCT s 
                    RETURN count(s) as cuenta`
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return {sustituciones_exitosas_hoy: resultado.records[0].get('cuenta')}
}

module.exports = {
    solicitarSustitucion,
    juzgarSugerencia,
    historialSustituciones,
    cuentaSustitucionesExitosasHoy
};
