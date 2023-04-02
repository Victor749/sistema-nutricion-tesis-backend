const neo4j = require('neo4j-driver');
var debug = require('debug')('sistema-nutricion-tesis-backend:conexion');

const urlDB = process.env.DATABASE_URL
const usuarioDB = process.env.DATABASE_USERNAME
const contrasenaDB = process.env.DATABASE_PASSWORD

const driver = neo4j.driver(urlDB, neo4j.auth.basic(usuarioDB, contrasenaDB), {disableLosslessIntegers: true});

async function ejecutarCypher(sentencia, params = {}) {
  const session = driver.session();
  try {
    const resultado = await session.run(sentencia, params);
    return resultado;
  } catch (error) {
    debug(error)
    throw error
  } finally {
    session.close();
  }
}

async function transaccionCypher() {
  const session = driver.session()
  const txc = session.beginTransaction()
  return {
    session: session,
    txc: txc
  }
}

module.exports = { 
  ejecutarCypher,
  transaccionCypher
};
