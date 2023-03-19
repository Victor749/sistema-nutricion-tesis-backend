const Joi = require('joi');

const usuarioSchema = Joi.object({
    nombre: Joi.string()
        .alphanum()
        .required(),

    apellido: Joi.string()
        .alphanum()
        .required(),

    email: Joi.string()
        .email()
        .required(),

    sexo: Joi.string()
        .valid('Masculino', 'Femenino')
        .required(),

    anio_nacimiento: Joi.number()
        .integer()
        .min(1900)
        .max(2013)
        .required(),

    peso: Joi.number()
        .integer()
        .min(2)
        .max(635)
        .required(),

    estatura: Joi.number()
        .integer()
        .min(50)
        .max(272)
        .required(),

    actividad_fisica: Joi.string()
        .valid('Ninguna', 'Moderada', 'Alta')
        .required(),
})

const validarUsuario = async (usuario) => {
    try {
        await usuarioSchema.validateAsync(usuario)
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
    validarUsuario
};
