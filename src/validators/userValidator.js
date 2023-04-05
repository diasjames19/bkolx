const { checkSchema } = require('express-validator')

module.exports = {
    editAction:checkSchema({
        token:{
                notEmpty:true
        },
        name:{
            optional:true,
            trim:true,
            isLength:{
                options:{min:2}
            },
            errorMessage:'Nome precisa ter no minimo dois caracter'
        },
        email:{
            optional:true,
            isEmail:true,
            normalizeEmail:true,
            errorMessage:'E-mail invaldido'
        },
        password:{
            optional:true,
            isLength:{
                options:{min:6}
            },
            errorMessage:'Senha precisa ter no minimo seis caracter'
        },
        state:{
            optional:true,
            notEmpty:true,
            errorMessage:'Preencha o estado'
        }
    }),
    signin:checkSchema({
       
        email:{
            isEmail:true,
            normalizeEmail:true,
            errorMessage:'E-mail invaldido'
        },
        password:{
            isLength:{
                options:{min:6}
            },
            errorMessage:'Senha precisa ter no minimo seis caracter'
        }
    })

    
};