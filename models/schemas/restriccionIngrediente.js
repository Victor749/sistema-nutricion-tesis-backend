const Joi = require('joi');

const restriccionIngredienteSchema = Joi.object({
    ingredienteID: Joi.number()
        .integer()
        .positive()
        .required(),

    tipo: Joi.string()
        .valid('Alergia', 'Gusto')
        .required(),
})

const validarRestriccionIngrediente = async (restriccionIngrediente) => {
    try {
        await restriccionIngredienteSchema.validateAsync(restriccionIngrediente)
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
    validarRestriccionIngrediente
};
