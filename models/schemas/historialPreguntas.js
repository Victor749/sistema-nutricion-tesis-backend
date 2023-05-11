const Joi = require('joi');

const historialPreguntasSchema = Joi.object({
    limite: Joi.number()
        .integer()
        .positive()
        .required(),

    pagina: Joi.number()
        .integer()
        .positive()
        .required(),
})

const validarHistorialPreguntas = async (historialPreguntas) => {
    try {
        await historialPreguntasSchema.validateAsync(historialPreguntas)
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
    validarHistorialPreguntas
};
