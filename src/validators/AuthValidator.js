const { checkSchema } = require('express-validator')

module.exports = {
    signup:checkSchema({
        name:{
            trim:true,
            isLength:{
                options:{min:2}
            },
            errorMessage:'Nome precisa ter no minimo dois caracter'
        },
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
        },
        state:{
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