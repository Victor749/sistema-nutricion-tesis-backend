const conexionNeo4j = require('../connection/conexionNeo4j');

const obtenerRecomendacionesAlimenticias = async (alimentoID) => {
    const params = {alimentoID: alimentoID}
    let sentencia = 'MATCH (a:Alimento {alimentoID : toInteger($alimentoID)})-[:INTEGRA]->(c:Categoria) ' +
                    'MATCH (ra:RecomendacionAlimenticia) ' + 
                    'WHERE (ra)-[:RECOMENDAR_EN_PRESENCIA_DE]->(c) ' + 
                    'OR ((ra)-[:RECOMENDAR_EN_AUSENCIA_DE]->() AND NOT (ra)-[:RECOMENDAR_EN_AUSENCIA_DE]->(c)) ' + 
                    'RETURN ra'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('ra').properties.mensaje)
}

module.exports = {
    obtenerRecomendacionesAlimenticias
};
   