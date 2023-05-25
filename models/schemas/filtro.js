const Joi = require('joi');

const filtroSchema = Joi.object({
    filtros: Joi.array()
        .min(1)
        .items(
            Joi.object().keys({
                tipo: Joi.string().valid('categoria_id', 'marca_id', 'clasificacion_nova').required(),
                valores: Joi.array().min(1).items(Joi.number().integer().positive()).unique().required(),
            })
        )
        .unique((a, b) => a.tipo === b.tipo),

    orden: Joi.string()
        .valid('nombre', 'clasificacion_nova'),

    ordenSentido: Joi.string()
        .valid('ASC', 'DESC'),

    limite: Joi.number()
        .integer()
        .positive()
        .required(),

    pagina: Joi.number()
        .integer()
        .positive()
        .required(),
})
    .with('orden', 'ordenSentido')

const validarFiltro = async (filtro) => {
    try {
        await filtroSchema.validateAsync(filtro)
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
    validarFiltro
};