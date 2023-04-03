const Joi = require('joi');

const restriccionSchema = Joi.object({
    tipo: Joi.string()
        .valid('Alergia', 'Gusto')
        .required(),
})

const validarRestriccion = async (restriccion) => {
    try {
        await restriccionSchema.validateAsync(restriccion)
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
    validarRestriccion
};
