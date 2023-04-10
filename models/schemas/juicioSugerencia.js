const Joi = require('joi');

const juicioSugerenciaSchema = Joi.object({
    aceptado: Joi.string()
        .valid('true', 'false')
        .required(),
})

const validarJuicioSugerencia = async (juicioSugerencia) => {
    try {
        await juicioSugerenciaSchema.validateAsync(juicioSugerencia)
        return json = {
            valido: true
        }
    }
    catch (err) { 
        return json = {
            valido: false,
            error: err
        }
    }
}

module.exports = {
    validarJuicioSugerencia
};
