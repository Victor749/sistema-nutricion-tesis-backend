const conexionNeo4j = require('../connection/conexionNeo4j');
const { Configuration, OpenAIApi } = require("openai");
const promptSchema = require('../models/schemas/prompt');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Se usa la API de OpenAI para obtener los parametros relevantes de un determinado numero de tipos de preguntas
// Esta cadena contiene conjunto de pares pregunta y respuesta (parametros) que se usan como entrenamiento
const entrenamiento = `
#¿Cuánto del nutriente azúcar hay en el alimento mango?; ¿Cuánta azúcar tiene un mango?
{"alimento": "mango", "nutriente": "azúcar", "tipo": 1}

#¿Cuál es el tamaño de porción del alimento galletas?; Dime a cuánto equivale una porción de las galletas
{"alimento": "galletas", "tipo": 2}

#¿Cuál es el tamaño de envase del alimento Natura?; Dime cuánto tiene el envase de Natura
{"alimento": "Natura", "tipo": 3}

#¿Cuál alimento tiene más del nutriente fibra entre un nabo y un melloco?; ¿Qué tiene más fibra entre un nabo o un melloco?
{"alimento1": "nabo", "alimento2": "melloco", "nutriente": "fibra", "tipo": 4}

#¿Cuál es la lista de nutrientes del alimento chorizo?; Dime la tabla nutricional del chorizo.
{"alimento": "chorizo", "tipo": 5}

#¿Cuáles son los ingredientes del alimento GelaToni?; Dime los ingredientes de la GelaToni.
{"alimento": "GelaToni", "tipo": 6}

#Cualquier otra cosa
{"tipo": 0}

#`;

// En esta funcion se determina el tipo de consulta que se debe hacer a la base de datos Neo4j dependiendo del tipo
// y los parametros obtenidos por la API de OpenAI
const ejecutarConsulta = async (params) => {
    const tipo = params.tipo
    delete params.tipo
    let sentencia = ""
    let resultado = {}
    let respuesta = ""
    let vacia = false
    switch(tipo) {
        case 0:
            respuesta = "Lo siento, no entendí su pregunta o no tengo la capacidad de responder a eso. ¿Puedo ayudarle en algo más?"
            break
        case 1:
            sentencia = 'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento) YIELD node as a ' +
                        'CALL db.index.fulltext.queryNodes("nombresNutrientes", $nutriente) YIELD node as n ' +
                        'MATCH (a)-[r1:TIENE]->(n)-[r2:SE_MIDE_POR]->(u:Unidad) ' +
                        'RETURN a, r1, n, u LIMIT 1'
            resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
            if (resultado.records[0]) {
                const alimento = resultado.records[0].get('a').properties.nombre
                const nutriente = resultado.records[0].get('n').properties.nombre
                const valor = resultado.records[0].get('r1').properties.valor
                const referencia = resultado.records[0].get('r1').properties.cantidad_referencia
                const unidad = resultado.records[0].get('u').properties.nombre
                respuesta = "Hay " + valor + " " + unidad + " de " + nutriente + " por cada " + referencia + " de " + alimento + "."
            } else {
                vacia = true
            }
            break
        case 2:
            sentencia = 'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento) YIELD node as a ' +
                        'MATCH (a)-[r:MIDE_TAMANO_PORCION_POR]->(u:Unidad) ' +
                        'RETURN a, u LIMIT 1'
            resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
            if (resultado.records[0]) {
                const alimento = resultado.records[0].get('a').properties.nombre
                const tam_porcion = resultado.records[0].get('a').properties.tam_porcion
                const unidad = resultado.records[0].get('u').properties.nombre
                respuesta = alimento + " tiene un tamaño de porción equivalente a " + tam_porcion + " " + unidad + "."
            } else {
                vacia = true
            }
            break
        case 3:
            sentencia = 'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento) YIELD node as a ' +
                        'MATCH (a)-[r:MIDE_TAMANO_ENVASE_POR]->(u:Unidad) ' +
                        'RETURN a, u LIMIT 1'
            resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
            if (resultado.records[0]) {
                const alimento = resultado.records[0].get('a').properties.nombre
                const tam_envase = resultado.records[0].get('a').properties.tam_envase
                const unidad = resultado.records[0].get('u').properties.nombre
                respuesta = alimento + " tiene un tamaño de envase equivalente a " + tam_envase + " " + unidad + "."
            } else {
                vacia = true
            }
            break
        case 4:
            sentencia = 'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento1) YIELD node as a1 ' +
                        'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento2) YIELD node as a2 ' +
                        'CALL db.index.fulltext.queryNodes("nombresNutrientes", $nutriente) YIELD node as n ' +
                        'MATCH (a1)-[r1:TIENE]->(n)-[r2:SE_MIDE_POR]->(u1:Unidad) ' + 
                        'MATCH (a2)-[r3:TIENE]->(n)-[r4:SE_MIDE_POR]->(u2:Unidad) ' +
                        'RETURN a1, a2, r1, r3, n, u1, u2 LIMIT 1'
            resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
            if (resultado.records[0]) {
                const alimento1 = resultado.records[0].get('a1').properties.nombre
                const alimento2 = resultado.records[0].get('a2').properties.nombre
                const nutriente = resultado.records[0].get('n').properties.nombre
                const valor1 = resultado.records[0].get('r1').properties.valor
                const referencia1 = resultado.records[0].get('r1').properties.cantidad_referencia
                const valor2 = resultado.records[0].get('r3').properties.valor
                const referencia2 = resultado.records[0].get('r3').properties.cantidad_referencia
                const unidad1 = resultado.records[0].get('u1').properties.nombre
                const unidad2 = resultado.records[0].get('u2').properties.nombre
                respuesta = alimento1 + " tiene " + valor1 + " " + unidad1 +  " de " + nutriente + " por cada " + referencia1 +
                            ", mientras que " + alimento2 + " tiene " + valor2 + " " + unidad2 +  " de " + nutriente + " por cada " + 
                            referencia2 + "."
                if (referencia1 === "100 g" && referencia2 === "100 g") {
                    let alimento_con_mas = ""
                    let alimento_con_menos = ""
                    let iguales = false
                    if (valor1 > valor2) {
                        alimento_con_mas = alimento1
                        alimento_con_menos = alimento2
                    } else if (valor1 < valor2) {
                        alimento_con_mas = alimento2
                        alimento_con_menos = alimento1
                    } else {
                        iguales = true
                    }
                    if (iguales) {
                        respuesta += " Por lo tanto, ambos alimentos tienen igual cantidad de " + nutriente + "."
                    } else {
                        respuesta += " Por lo tanto, " + alimento_con_mas + " tiene más " + nutriente + " que " + alimento_con_menos + "."
                    }
                    
                }
            } else {
                vacia = true
            }
            break
        case 5:
            sentencia = 'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento) YIELD node as a WITH a LIMIT 1 ' +
                        'MATCH (a)-[r1:TIENE]->(n:Nutriente)-[r2:SE_MIDE_POR]->(u:Unidad) RETURN a, r1, n, u'
            resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
            if (resultado.records[0]) {
                const alimento = resultado.records[0].get('a').properties.nombre
                const nutrientes = resultado.records.map(record => record.get('n').properties.nombre)
                const valores = resultado.records.map(record => record.get('r1').properties.valor)
                const referencias = resultado.records.map(record => record.get('r1').properties.cantidad_referencia)
                const unidades = resultado.records.map(record => record.get('u').properties.nombre)
                respuesta = alimento + " tiene la siguiente tabla nutricional: \n"
                for (let i = 0; i < nutrientes.length; i++) {
                    respuesta += "- " + nutrientes[i] + " (" + valores[i] + " " + unidades[i] + " por cada " + referencias[i] + ")\n"
                }
            } else {
                vacia = true
            }
            break
        case 6:
            sentencia = 'CALL db.index.fulltext.queryNodes("nombresAlimentos", $alimento) YIELD node as a WITH a LIMIT 1 ' +
                        'MATCH (a)-[:CONTIENE]->(i:Ingrediente) RETURN a, i'
            resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
            if (resultado.records[0]) {
                const alimento = resultado.records[0].get('a').properties.nombre
                const ingredientes = resultado.records.map(record => record.get('i').properties.descripcion)
                respuesta = alimento + " tiene los siguientes ingredientes: \n"
                ingredientes.forEach(ingrediente => {
                    respuesta += "- " + ingrediente + "\n"
                });
            } else {
                vacia = true
            }
            break
        default:
            respuesta = "¡Vaya! Ocurrió algo inesperado. Inténtelo de nuevo más tarde o contacte con el servicio de asistencia."
            break
    }
    if (vacia) {
        respuesta = "Disculpe, no soy capaz de responder a su pregunta. Puede que no exista información suficiente para hacerlo. " +
                    "O podría necesitar ser más específico (use nombres que sean lo más precisos posibles)."
    }
    return respuesta
}

// Con esta funcion se procesan las preguntas de los usuarios, se obtienen el tipo y los parametros de la misma,
// para luego enviarlos a la funcion ejecutarConsulta. Aqui se configura el acceso al metodo de completar de OpenAI
const hacerPregunta = async (promt) => {
    const validacion = await promptSchema.validarPrompt(promt)
    if (!validacion.valido) { 
        return json = {
            error: validacion.error.details[0].message.toString(),
            codigo: 400
        }
    }
    const respuesta = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: entrenamiento + promt.pregunta + "\n",
        temperature: 0,
        max_tokens: 150,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop: ["#", ";"],
    });
    try {
        const params = JSON.parse(respuesta.data.choices[0].text)
        return await ejecutarConsulta(params)
    } catch(error) {
        throw error
    }
}

module.exports = {
    hacerPregunta
};
