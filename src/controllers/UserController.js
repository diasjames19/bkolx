const State = require('../models/State');
const User = require('../models/User');
const Category = require('../models/category');
const Ad = require('../models/Ad');
const {validationResult, matchedData} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


module.exports = {

    getStates: async(req, res)=>{
            let states = await State.find();
            res.json({states});
    },

    info: async(req, res)=>{

        let {token} = req.query;
        const user = await User.findOne({token});
        const state = await State.findById(user.state);
        const ads = await Ad.find({idUser: user._id.toString()});


        let adList = [];

        for(let dados in ads){
            const cat = await Category.findById(ads[i].category);
            adList.push({
                id:ads[dados]._id,
                status:ads[dados].status,
                images:ads[dados].images,
                dateCreated:ads[dados].dateCreated,
                title:ads[dados].title,
                price:ads[dados].prece,
                priceNegotiable:ads[dados].priceNegotiable,
                description:ads[dados].description,
                views:ads[dados].views,
                category:cat.slug
            });

           //adList.push({...ads[dados], category: cat.slug})
        }

            res.json({
                name:user.name,
                email:user.email,
                state:state.name,
                ads:adList
            })
    },
    editAction:async(req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.json({error:errors.mapped()});
            return;
        }
        const data = matchedData(req);
        let updates = {};
        if(data.name){
            updates.name = data.name;
        }
        if(data.email){
                const emailCheck = await User.findOne({email:data.email});
                if(emailCheck){
                    res.json({error: 'E-mail já existe!'});
                    return;
                }
                updates.email = data.email;
        }
        if(data.state){
            if(mongoose.Types.ObjectId.isValid(data.state)){
                const stateCheck = await State.findById(data.state);
                if(!stateCheck){
                    res.json({
                        erro:{
                            state:{msg:'Estado não existe'}
                        }
                    });
                    return;
                }
                    updates.state = data.state;
                }else{
                    res.json({
                        error:{
                            state:{msg:'Codigo do estado Invalido'}
                        }
                    });
                    return;
                }
        }
            if(data.password){
                updates.passwordHash = await bcrypt.hash(data.password, 10);
            }

            await User.findOneAndUpdate({token: data.token}, {$set: updates});
            res.json({update: 'Alteração realizada com Sucesso!'});
    }
};


