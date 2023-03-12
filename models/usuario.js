const conexionNeo4j = require('../connection/conexionNeo4j');

const crear = async (usuario) => {
    usuarioID = 1
    const resultado = await conexionNeo4j.ejecutarCypher(`CREATE (u:Usuario {usuarioID : '${usuarioID}', nombre: '${usuario.nombre}', email: '${usuario.email}'}) RETURN u`)
    return resultado.records[0].get('u').properties
}

module.exports = {
    crear
};
   