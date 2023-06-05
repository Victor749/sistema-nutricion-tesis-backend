const conexionNeo4j = require('../connection/conexionNeo4j');

const obtenerRecomendacionesGenerales = async (usuarioID) => {
    const params = {usuarioID: usuarioID}
    let sentencia = 'MATCH (u:Usuario {usuarioID : $usuarioID}) ' +
                    'MATCH (rg:RecomendacionGeneral WHERE rg.imc_minimo <= u.imc AND rg.findrisc_minimo <= u.findrisc) RETURN rg'
    const resultado = await conexionNeo4j.ejecutarCypher(sentencia, params)
    return resultado.records.map(record => record.get('rg').properties.mensaje)
}

module.exports = {
    obtenerRecomendacionesGenerales
};
   