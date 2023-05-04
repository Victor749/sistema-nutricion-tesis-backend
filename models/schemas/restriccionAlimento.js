const Joi = require('joi');

const restriccionAlimentoSchema = Joi.object({
    tipo: Joi.string()
        .valid('Alergia', 'Gusto')
        .required(),
})

const validarRestriccionAlimento = async (restriccionAlimento) => {
    try {
        await restriccionAlimentoSchema.validateAsync(restriccionAlimento)
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
    validarRestriccionAlimento
};
