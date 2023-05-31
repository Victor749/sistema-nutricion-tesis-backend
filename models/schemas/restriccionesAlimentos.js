const Joi = require('joi');

const restriccionesAlimentosSchema = Joi.object({
    restriccionesAlimentos: Joi.array()
        .min(1)
        .items(
            Joi.object().keys({
                alimentoID: Joi.number().integer().positive().required(),
                tipo: Joi.string().valid('Alergia', 'Gusto').required(),
            })
        )
        .required(),
})

const validarRestriccionesAlimentos = async (restriccionesAlimentos) => {
    try {
        await restriccionesAlimentosSchema.validateAsync(restriccionesAlimentos)
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
    validarRestriccionesAlimentos
};
