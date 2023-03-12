const neo4j = require('neo4j-driver');

const urlDB = process.env.DATABASE_URL
const usuarioDB = process.env.DATABASE_USERNAME
const contrasenaDB = process.env.DATABASE_PASSWORD

const driver = neo4j.driver(urlDB, neo4j.auth.basic(usuarioDB, contrasenaDB));

async function ejecutarCypher(sentencia) {
  const session = driver.session();
  try {
    const resultado = await session.run(sentencia);
    return resultado;
  } catch (error) {
    throw error;
  } finally {
    session.close();
  }
}

module.exports = { ejecutarCypher };
