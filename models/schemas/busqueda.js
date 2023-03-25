const Joi = require('joi');

const busquedaSchema = Joi.object({
    cadenaBusqueda: Joi.string()
        .required(),

    limite: Joi.number()
        .integer()
        .positive()
        .required(),
})

const validarBusqueda = async (busqueda) => {
    try {
        await busquedaSchema.validateAsync(busqueda)
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
    validarBusqueda
};