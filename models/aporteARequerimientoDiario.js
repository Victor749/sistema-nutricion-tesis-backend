const conexionNeo4j = require('../connection/conexionNeo4j');

// --- INICIO ---  Funciones para calculo de metricas nutricionales de usuarios ---

const categoriaIMC = async (imc) => { // Categoria IMC
    if (imc < 25) {
        return 'Normal'
    } else if (imc >= 25 && imc < 30) {
        return 'Sobrepeso'
    } else if (imc >= 30 && imc < 35) {
        return 'Obesidad C1'
    } else if (imc >= 35 && imc < 40) {
        return 'Obesidad C2'
    } else {
        return 'Obesidad C3'
    }
}

const deficit = { // Deficit de calorias segun categoria IMC
    'Normal': 0,
    'Sobrepeso': 500,
    'Obesidad C1': 583,
    'Obesidad C2': 666,
    'Obesidad C3': 750
}

const pal = { // Niveles de Actividad Fisica
    'Sendetaria': 1.2,
    'Ligera': 1.375,
    'Moderada': 1.55,
    'Alta': 1.725,
    'Extrema': 1.9
}

const calcularTDEE = async (peso, estatura, edad, sexo, nivel_actividad_fisica, imc) => { // Estimacion de gasto energetico diario total
    // Calculo de RMC (Tasa metabolica en reposo) usando las ecuaciones predicitivas de Mifflin-St. Jeor
    let rmc = (10 * peso) + (6.25 * estatura) - (5 * edad)
    if (sexo === 'Hombre') {
        rmc += 5
    } else { // Mujer
        rmc -= 161
    }
    const categoria_imc = await categoriaIMC(imc)
    const tdee = (rmc * pal[nivel_actividad_fisica]) - deficit[categoria_imc]
    return parseInt(tdee) 
}

const obtenerRequerimientosNutricionales = async (usuario) => { // Estimacion del requerimiento diario de nutrientes para un usuario
    const edad = parseInt(new Date().getFullYear()) - usuario.anio_nacimiento
    const tdee = await calcularTDEE(usuario.peso, usuario.estatura, edad, usuario.sexo, usuario.nivel_actividad_fisica, usuario.imc)
    const params = {edad: edad}
    const sentencia = 'MATCH (ge:GrupoEdad)-[r:REQUIERE_DIARIAMENTE]->(n:Nutriente)-[:SE_MIDE_POR]->(u:Unidad) WHERE ge.edad_minima <= $edad ' +
                      'AND ge.edad_maxima >= $edad RETURN n, r, u'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    let macros = {'kcal Energía': {valor: tdee, unidad: 'kcal'}}
    let nutrientes = ['kcal Energía']
    resultado.records.forEach(record => {
        let nutriente = record.get('n').properties.nombre
        let unidad = record.get('u').properties.nombre
        let porcentaje = record.get('r').properties.porcentaje
        let kcal_por_g = record.get('r').properties.kcal_por_g
        let cantidad_mg = record.get('r').properties.cantidad_mg
        macros[nutriente] = {}
        nutrientes.push(nutriente)
        if (porcentaje) { // Valor referencial porcentual
            macros[nutriente]['valor'] = parseInt(((tdee * porcentaje) / 100) / kcal_por_g)
        } else { // Valor referencial por cantidad en mg
            macros[nutriente]['valor'] = parseInt(cantidad_mg)
        }
        macros[nutriente]['unidad'] = unidad
    })
    return {macros: macros, nutrientes: nutrientes}
}

// --- FIN ---  Funciones para calculo de metricas nutricionales de usuarios ---

// --- INICIO ---  Funciones para calculo de metricas nutricionales de alimentos ---

const calcularAporteAlimento = async (alimentoID, referencia) => { // Estimacion del aporte de nutrientes de un alimento
    const params = {alimentoID: alimentoID, referencia: referencia}
    const sentencia = 'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)})-[r:TIENE]->(n:Nutriente)-[r2:SE_MIDE_POR]->(u:Unidad) ' +
                      'WHERE r.cantidad_referencia = $referencia ' + 
                      "AND (n.nombre = 'kcal Energía' OR (:GrupoEdad)-[:REQUIERE_DIARIAMENTE]->(n)-[:SE_MIDE_POR]->(u)) RETURN n, r, u"
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    let macros = {}
    resultado.records.forEach(record => {
        let nutriente = record.get('n').properties.nombre
        let unidad = record.get('u').properties.nombre
        let valor = record.get('r').properties.valor
        macros[nutriente] = {}
        macros[nutriente]['valor'] = parseInt(valor)
        macros[nutriente]['unidad'] = unidad
    })
    return macros
}

// --- FIN ---  Funciones para calculo de metricas nutricionales de alimentos ---

const calcularAporteARequerimientoDiario = async (usuarioID, alimentoID) => {
    const params = {usuarioID: usuarioID, alimentoID: alimentoID}
    const sentencia = 'MATCH (u:Usuario {usuarioID: $usuarioID})' +
                      'MATCH (a:Alimento {alimentoID: toInteger($alimentoID)}) ' +
                      'OPTIONAL MATCH (a)-[:MIDE_TAMANO_ENVASE_POR]->(ue:Unidad) ' +
                      'OPTIONAL MATCH (a)-[:MIDE_TAMANO_PORCION_POR]->(up:Unidad) ' + 
                      "OPTIONAL MATCH (a)-[r:TIENE]->(n:Nutriente WHERE n.nombre = 'kcal Energía') RETURN u, a, ue, up, r"
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    if (resultado.records[0]) {
        const usuario = resultado.records[0].get('u').properties
        const alimento = resultado.records[0].get('a').properties
        const unidad_envase = resultado.records[0].get('ue') ? resultado.records[0].get('ue').properties.nombre : false
        const unidad_porcion = resultado.records[0].get('ue') ? resultado.records[0].get('up').properties.nombre : false
        const referencia = resultado.records[0].get('r').properties.cantidad_referencia
        const requerimientos = await obtenerRequerimientosNutricionales(usuario)
        const macros_usuario = requerimientos.macros
        const nutrientes = requerimientos.nutrientes
        const macros_alimento = await calcularAporteAlimento(alimentoID, referencia)
        const en_referencia_a = {referencia: referencia}
        if (referencia !== '100 g') {
            if (alimento.tam_porcion && unidad_porcion) {
                en_referencia_a['porcion'] = alimento.tam_porcion
                en_referencia_a['unidad_porcion'] = unidad_porcion
            }
            if (alimento.tam_envase && unidad_envase) {
                en_referencia_a['envase'] = alimento.tam_envase
                en_referencia_a['unidad_envase'] = unidad_envase
            }
            if (alimento.num_porciones_x_envase) {en_referencia_a['num_porciones_x_envase'] = alimento.num_porciones_x_envase}
        } 
        let aporte = {en_referencia_a: en_referencia_a}
        aporte['nutrientes'] = {}
        nutrientes.forEach(nutriente => {
            if (macros_alimento[nutriente] && (macros_usuario[nutriente]['unidad'] === macros_alimento[nutriente]['unidad']))  {
                aporte['nutrientes'][nutriente] = {}
                aporte['nutrientes'][nutriente]['porcentaje_aporte'] = parseInt((macros_alimento[nutriente]['valor'] / macros_usuario[nutriente]['valor']) * 100)
                aporte['nutrientes'][nutriente]['requerimiento_usuario'] = macros_usuario[nutriente]['valor']
                aporte['nutrientes'][nutriente]['aporte_alimento'] = macros_alimento[nutriente]['valor']
                aporte['nutrientes'][nutriente]['unidad'] = macros_alimento[nutriente]['unidad']
            }
        })
        return aporte
    } else {
        return json = {
            error: 'Usuario y/o alimento no encontrado(s).',
            codigo: 404
        }
    }
}

module.exports = {
    calcularAporteARequerimientoDiario
};
   