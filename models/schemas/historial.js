const Joi = require('joi');

const historialSchema = Joi.object({
    limite: Joi.number()
        .integer()
        .positive()
        .required(),

    pagina: Joi.number()
        .integer()
        .positive()
        .required(),
})

const validarHistorial = async (historial) => {
    try {
        await historialSchema.validateAsync(historial)
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
    validarHistorial
};