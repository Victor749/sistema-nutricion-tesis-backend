const conexionNeo4j = require('../connection/conexionNeo4j');
const Neo4jError =  require('neo4j-driver-core/lib/error.js');
const { Configuration, OpenAIApi } = require("openai");
const promptSchema = require('../models/schemas/prompt');
const historialSchema = require('../models/schemas/historial');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const entrenamientoTexto2Cypher = `
Eres un asistente con la capacidad de generar consultas Cypher basadas en consultas Cypher de ejemplo.
Las consultas de Cypher de ejemplo son:

#¿Cuánto del nutriente azúcar hay en el alimento mango?; ¿Cuánta azúcar tiene un mango?
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'mango') YIELD node as a
CALL db.index.fulltext.queryNodes('nombresNutrientes', 'azúcar') YIELD node as n
MATCH (a)-[r1:TIENE]->(n)-[r2:SE_MIDE_POR]->(u:Unidad)
RETURN {valor_nutricional: {alimento: a.nombre, valor: r1.valor, referencia: r1.cantidad_referencia,
nutriente: n.nombre, unidad: u.nombre}} as resultado LIMIT 1

#¿Cuál es el tamaño de porción del alimento galletas?; Dime a cuánto equivale una porción de las galletas.
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'galletas') YIELD node as a
MATCH (a)-[r:MIDE_TAMANO_PORCION_POR]->(u:Unidad)
RETURN {porcion: {alimento: a.nombre, tamano_porcion: a.tam_porcion, unidad: u.nombre}} as resultado LIMIT 1

#¿Cuál es el tamaño de envase del alimento yogurt?; Dime cuánto tiene el envase de yogurt.
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'yogurt') YIELD node as a
MATCH (a)-[r:MIDE_TAMANO_ENVASE_POR]->(u:Unidad)
RETURN {envase: {alimento: a.nombre, tamano_envase: a.tam_envase, unidad: u.nombre}} as resultado LIMIT 1

#¿Cuál alimento tiene más del nutriente fibra entre un nabo y un melloco?; ¿Qué tiene más fibra entre un nabo o un melloco?
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'nabo') YIELD node as a1
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'melloco') YIELD node as a2
CALL db.index.fulltext.queryNodes('nombresNutrientes', 'fibra') YIELD node as n
MATCH (a1)-[r1:TIENE]->(n)-[r2:SE_MIDE_POR]->(u:Unidad)
MATCH (a2)-[r3:TIENE]->(n)
RETURN {comparacion_nutricional: {valor_nutricional1: {alimento: a1.nombre, valor: r1.valor, referencia: r1.cantidad_referencia},
valor_nutricional2: {alimento: a2.nombre, valor: r3.valor, referencia: r3.cantidad_referencia},
nutriente: n.nombre, unidad: u.nombre}} as resultado LIMIT 1

#¿Cuál es la lista de nutrientes del alimento chorizo?; Dime la tabla nutricional del chorizo.
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'chorizo') YIELD node as a WITH a LIMIT 1
MATCH (a)-[r1:TIENE]->(n:Nutriente)-[r2:SE_MIDE_POR]->(u:Unidad)
WITH a as a, collect({valor: r1.valor, referencia: r1.cantidad_referencia, nutriente: n.nombre, unidad: u.nombre}) as nutrientes
RETURN {tabla_nutricional: {alimento: a.nombre, nutrientes: nutrientes}} as resultado

#¿Cuáles son los ingredientes del alimento GelaToni?; Dime los ingredientes de la GelaToni.
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'GelaToni') YIELD node as a WITH a LIMIT 1
MATCH (a)-[r:CONTIENE]->(i:Ingrediente)
WITH a as a, collect({ingrediente: i.descripcion}) as ingredientes
RETURN {lista_ingredientes: {alimento: a.nombre, ingredientes: ingredientes}} as resultado

#Proporciona información general del alimento queso; Dame información del queso.
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'queso') YIELD node as a
OPTIONAL MATCH (a)-[r1:INTEGRA]->(c:Categoria)
OPTIONAL MATCH (a)-[r2:CORRESPONDE]->(m:Marca)
OPTIONAL MATCH (a)-[r3:CORRESPONDE]->(m)-[r4:PERTENECE]->(e:Empresa)
OPTIONAL MATCH (a)-[r5:MIDE_TAMANO_ENVASE_POR]->(ue:Unidad)
OPTIONAL MATCH (a)-[r6:MIDE_TAMANO_PORCION_POR]->(up:Unidad)
RETURN {alimento: {nombre: a.nombre, categoria: c.nombre, marca: m.nombre, empresa: e.nombre, porcion: a.tam_porcion + up.nombre,
envase: a.tam_envase + ue.nombre, porciones_por_envase: a.num_porciones_x_envase, clasificacion_nova: a.clasificacion_nova,
advertencia_azucar: a.advertencia_azucar, advertencia_sal: a.advertencia_sal, advertencia_grasa: a.advertencia_grasa}}
as resultado LIMIT 1

#Sugiere alimentos de la categoría snacks que no contengan los ingredientes sal, papas o queso; Dime snacks sin sal, papas o queso.
CALL db.index.fulltext.queryNodes('nombresCategorias', 'snacks') YIELD node as c WITH c LIMIT 1
CALL db.index.fulltext.queryNodes('nombresIngredientes', 'sal OR papas OR queso') YIELD node as i
MATCH (a:Alimento)-[r1:INTEGRA]->(c)
WHERE NOT (a)-[:CONTIENE]->(i)
WITH c, a as a LIMIT 5
WITH c, collect({alimento: a.nombre}) as alimentos
RETURN {recomendacion: {categoria: c.nombre, restricciones_proporcionadas: 'sal, papas, queso', sugerencias: alimentos}} as resultado

#¿Qué categorías de alimentos produce la empresa Tonicorp?; Dime las categorías de productos de Tonicorp.
CALL db.index.fulltext.queryNodes('nombresEmpresas', 'Tonicorp') YIELD node as e
CALL {
    WITH e
    MATCH (c:Categoria)<-[:INTEGRA]-(:Alimento)-[:CORRESPONDE]->(:Marca)-[:PERTENECE]->(e)
    RETURN DISTINCT c.nombre as categoria
}
WITH e, collect(categoria) as categorias
RETURN {categorias_por_empresa: {empresa: e.nombre, categorias: categorias}} as resultado

#¿Qué alimentos que sean jamones tiene la marca Plumrose?; Dime los jamones que oferta Plumrose.
CALL db.index.fulltext.queryNodes('nombresMarcas', 'Plumrose') YIELD node as m
CALL {
    WITH m
    CALL db.index.fulltext.queryNodes('nombresAlimentos', 'jamon') YIELD node as a
    MATCH (a)-[:CORRESPONDE]->(m)
    RETURN a.nombre as alimento
}
WITH m, collect(alimento) as alimentos
RETURN {alimentos_por_marca: {marca: m.nombre, alimentos: alimentos, tipo_alimento: 'jamon'}} as resultado

#¿Qué alimento puede reemplazar el alimento tigreton?; Dime un sustituto del tigreton.
CALL db.index.fulltext.queryNodes('nombresAlimentos', 'tigreton') YIELD node as a WITH a LIMIT 1
MATCH (a)-[r:DISTA]->(a2:Alimento)
WITH a, a2 ORDER BY r.distancia LIMIT 5
WITH a, collect(a2.nombre) as sugerencias
RETURN {sustitucion: {alimento_a_sustituir: a.nombre, sugerencias: sugerencias}} as resultado

No respondas con ninguna explicación o cualquier otra información, excepto la consulta Cypher.
Nunca te disculpes y genera estrictamente declaraciones Cypher basadas en los ejemplos proporcionados.
No proporciones sentencias Cypher que no se puedan deducir de los ejemplos.
Informa al usuario cuando no puedas inferir la sentencia Cypher debido a la falta de contexto de la conversación e indica cuál es el contexto faltante.
`;

const entrenamientoJSON2Texto = `
Eres un asistente que ayuda a generar texto para formar respuestas agradables y comprensibles para los humanos.
El mensaje más reciente contiene la información, y debes generar una respuesta legible por humanos basada en la información proporcionada.
Haz que parezca que la información proviene de un asistente de IA, pero no agregues ninguna información.
No agregues ninguna información adicional que no se proporcione explícitamente en el mensaje más reciente.
Repito, no añadas ninguna información que no esté explícitamente dada.
`

const hacerPregunta = async (usuarioID, prompt) => {
    const validacion = await promptSchema.validarPrompt(prompt)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }

    const params = {usuarioID: usuarioID, interrogante: prompt.pregunta.trim()}
    let respuesta = ""

    let mensajesTexto2Cypher = []
    mensajesTexto2Cypher.push({ role: "system", content: entrenamientoTexto2Cypher })
    mensajesTexto2Cypher.push({ role: "user", content: prompt.pregunta.trim() })
    const respuestaTexto2Cypher = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: mensajesTexto2Cypher,
        temperature: 0.0,
    });
    const sentencia = respuestaTexto2Cypher.data.choices[0].message.content
    params.sentenciaCypher = sentencia
    console.log("\n" + "******* SENTENCIA *******" + "\n" + sentencia + "\n")

    try {
        const resultado = await conexionNeo4j.ejecutarCypher(sentencia)
            if (resultado.records[0]) {
                const informacion = JSON.stringify(resultado.records[0].get('resultado'))
                params.informacionJSON = informacion
                console.log("\n" + "******* RESULTADO *******" + "\n" + informacion + "\n")
                let mensajesJSON2Texto = []
                mensajesJSON2Texto.push({ role: "system", content: entrenamientoJSON2Texto })
                mensajesJSON2Texto.push({ role: "user", content: informacion})
                const respuestaJSON2Texto = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: mensajesJSON2Texto,
                    temperature: 0.0,
                });
                respuesta = respuestaJSON2Texto.data.choices[0].message.content.trim()
            } else {
                respuesta = "Lo siento, no pude encontrar información para responder a tu pregunta. " +
                       "Puede que no exista información suficiente para hacerlo. O podrías necesitar ser más específico " +
                       "(usa conceptos y nombres que sean lo más precisos posibles). ¿Puedo ayudarte en algo más?"
            }
    } catch(error) {
        if (error instanceof Neo4jError.Neo4jError) { // Contesta la respuesta original de la API, pueden ser saludos, despedidas, aclaraciones, etc.
            if (sentencia.includes("MATCH") && sentencia.includes("RETURN")) {
                respuesta = "Lo siento, parece que no soy capaz de responder a esa pregunta. O podrías necesitar ser más específico " +
                       "(usa conceptos y nombres que sean lo más precisos posibles). ¿Puedo ayudarte en algo más?"
            } else {
                respuesta = sentencia.trim()
            }
        } else {
            throw error
        }
    }
    params.respuesta = respuesta
    let sentencia_guardar_pregunta = "MATCH (u:Usuario {usuarioID: $usuarioID})" +
                                     "CREATE (u)-[:HACE]->(p:Pregunta {interrogante: $interrogante, sentenciaCypher: $sentenciaCypher, respuesta: $respuesta, "
    if (params.informacionJSON) {
        sentencia_guardar_pregunta += "informacionJSON: $informacionJSON, "
    }
    sentencia_guardar_pregunta += "fecha_hora: toString(datetime({timezone: 'America/Guayaquil'}))}) RETURN p"
    const resultado_guardar_pregunta = await conexionNeo4j.ejecutarCypher(sentencia_guardar_pregunta, params)
    return resultado_guardar_pregunta.records[0].get('p').properties.respuesta
}

const historialPreguntas = async (usuarioID, limite = 5, pagina = 1) => {
    let params = {
        limite: limite,
        pagina: pagina
    }
    const validacion = await historialSchema.validarHistorial(params)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    params.usuarioID = usuarioID
    let sentencia = "MATCH (u:Usuario {usuarioID: $usuarioID})-[:HACE]->(p:Pregunta) " +
                    "RETURN p ORDER BY p.fecha_hora DESC " +
                    "SKIP toInteger($pagina) * toInteger($limite) - toInteger($limite) LIMIT toInteger($limite)"
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('p').properties)
}

module.exports = {
    hacerPregunta,
    historialPreguntas
};
