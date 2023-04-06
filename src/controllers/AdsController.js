const Category = require('../models/category');
const User = require('../models/User');
const State = require('../models/State');
const {v4:uuidv4} = require('uuid');
const jimp = require('jimp');
const Ad = require('../models/Ad');
const {validationResult, matchedData} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const addImage = async (buffer)=>{
    let newName  = `${uuidv4()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;


}

module.exports = {

    getCategories:async(req, res)=>{
        let cats = await Category.find();
        let categories =  [];
        for(let index in cats){
            categories.push({
                ...cats[index]._doc,
                img:`${process.env.BASE}/assets/images/${cats[index].slug}.png`
            });
        }
        res.json({categories})

    },
    addAction:async(req, res)=>{

        let {title, price, priceneg, desc, cat, token} = req.body;
        const user = await User.findOne({token}).exec();
        if(!title || !cat){
            res.jason({error:'Titulo e/ou categoria não froram preenchido! '});
            return;
        }
        if(cat.length < 24){
            res.json({error:'ID da categoria invalido!'});
            return;
        }
        const category = await Category.findById(cat);

        if(!category){
            res.jason({error:'Categoria não existe!'});
            return;
        }
        if(price){
            price = price
            .replace('.', '')
            .replace(',', '.')
            .replace('R$ ', '');
           price = parseFloat(price)

        }else{
            price=0;
        }
        const newAd = new Ad();
        newAd.status = true;
        newAd.idUser = user._id;
        newAd.state = user.state;
        newAd.dateCreated = new Date();
        newAd.title = title;
        newAd.category = cat;
        newAd.price = price;
        newAd.priceNegotiable = (priceneg === 'true')?true : false;
        newAd.description = desc;
        newAd.views = 0;
        if(req.files && req.files.img){
            if(['image/jpeg','image/jpg','image/png'].includes(req.files.img.mimetype)){
                let urlNewName = await addImage(req.files.img.data);
                newAd.images.push({
                    urlNewName,
                    default:false
                });
            }
         else{
                for(let index = 0; index < req.files.img.length; index++){
                    if(['image/jpeg','image/jpg','image/png'].includes(req.files.img[index].mimetype)){
                        let urlNewName = await addImage(req.files.img[index].data);
                        newAd.images.push({
                            urlNewName,
                            default:false
                        });
                    }


                }
            }
        }
        if(newAd.images.length > 0){
            newAd.images[0].default = true;
        }

        const info = await newAd.save();
        res.json({id:info._id});
    },
    getList:async(req, res)=>{

    },
    getItem:async(req, res)=>{

    },
    editAction:async(req, res)=>{

    }
};