const Joi = require('joi');

const restriccionesEtiquetasSchema = Joi.object({
    restriccionesEtiquetas: Joi.array()
        .items(
            Joi.object().keys({
                texto: Joi.string().required(),
                tipo: Joi.string().valid('Alergia', 'Gusto').required(),
            })
        )
        .required(),
})

const validarRestriccionesEtiquetas = async (restriccionesEtiquetas) => {
    try {
        await restriccionesEtiquetasSchema.validateAsync(restriccionesEtiquetas)
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
    validarRestriccionesEtiquetas
};
