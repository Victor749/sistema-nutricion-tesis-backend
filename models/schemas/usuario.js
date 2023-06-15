const Joi = require('joi');

const usuarioSchema = Joi.object({
    usuarioID: Joi.string()
        .alphanum()
        .required(),

    nombre: Joi.string()
        .required(),

    apellido: Joi.string()
        .required(),

    email: Joi.string()
        .email()
        .required(),

    sexo: Joi.string()
        .valid('Hombre', 'Mujer')
        .required(),

    anio_nacimiento: Joi.number()
        .integer()
        .min(1900)
        .max(2005)
        .required(),

    peso: Joi.number() // kg
        .integer()
        .min(2)
        .max(635)
        .required(),

    estatura: Joi.number() // cm
        .integer()
        .min(50)
        .max(272)
        .required(),
    
    cintura: Joi.number() // cm
        .integer()
        .min(38)
        .max(300)
        .required(),

    actividad_fisica_diaria: Joi.string()
        .valid('Sí', 'No')
        .required(),
    
    nivel_actividad_fisica: Joi.string()
        .valid('Sedentaria', 'Ligera', 'Moderada', 'Alta', 'Extrema')
        .required(),

    frecuencia_consumo_frutas_verduras_cereales: Joi.string()
        .valid('Cada día', 'No todos los días')
        .required(),

    medicacion_hipertension: Joi.string()
        .valid('Sí', 'No')
        .required(),

    alta_glucosa: Joi.string()
        .valid('Sí', 'No')
        .required(),
    
    familiar_con_diabetes: Joi.string()
        .valid('No', 'Sí: abuelos, tía, tío o primo hermano', 'Sí: padres, hermano, hermana o hijo')
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
