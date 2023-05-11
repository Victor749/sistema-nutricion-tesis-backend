const Joi = require('joi')
.extend(require('@joi/date'));

const historialSustitucionesSchema = Joi.object({
    fecha: Joi.date()
        .format('YYYY-MM-DD')
        .required(),

    limite: Joi.number()
        .integer()
        .positive()
        .required(),

    pagina: Joi.number()
        .integer()
        .positive()
        .required(),
})

const validarHistorialSustituciones = async (historialSustituciones) => {
    try {
        await historialSustitucionesSchema.validateAsync(historialSustituciones)
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
    validarHistorialSustituciones
};
