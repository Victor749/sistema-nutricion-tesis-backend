const Joi = require('joi');

const restriccionesCategoriasSchema = Joi.object({
    restriccionesCategorias: Joi.array()
        .items(
            Joi.object().keys({
                categoriaID: Joi.number().integer().positive().required(),
                tipo: Joi.string().valid('Alergia', 'Gusto').required(),
            })
        )
        .required(),
})

const validarRestriccionesCategorias = async (restriccionesCategorias) => {
    try {
        await restriccionesCategoriasSchema.validateAsync(restriccionesCategorias)
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
    validarRestriccionesCategorias
};
