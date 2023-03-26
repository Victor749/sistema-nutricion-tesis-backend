const Joi = require('joi');

const filtroSchema = Joi.object({
    filtro: Joi.string()
        .valid('categoria_id', 'marca_id', 'clasificacion_nova'),

    valorFiltro: Joi.number()
        .integer()
        .positive(),

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
    .with('filtro', 'valorFiltro')
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