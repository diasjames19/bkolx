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
            res.json({error:'Titulo e/ou categoria não froram preenchido! '});
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
        // 
        let {sort = 'asc',offset = 0, limit = 8, q, cat, state} = req.query;
        let filters = {status:true};
        let total = 0;

        if(q){
            filters.title = {'$regex':q, '$options':'i'};
        }
        if(cat){
            const catSlug = await Category.findOne({slug:cat}).exec();
            if(catSlug){
                filters.category = catSlug._id.toString();
            }  
        }
        if(state){
            const stateName = await State.findOne({name: state.toUpperCase()}).exec();
            if(stateName){
                filters.state = stateName._id.toString();
            }
        }

        const adsTotal =  await Ad.find(filters).exec();
        total = adsTotal.length;
        const adData = await Ad.find(filters)
            .sort({dataCreated:(sort === 'desc' ? -1 : 1)})
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec();

            let adsList = [];

            for(let index in adData){
                    let image;
                    let defaultImg = adData[index].images.find(e => e.default);
                    if(defaultImg){
                        image = `${process.env.BASE}/media/${defaultImg.urlNewName}`
                    }else{
                        image = `${process.env.BASE}/media/default.jpg`;
                    }

                    adsList.push({
                        id:adData[index]._id,
                        title:adData[index].title,
                        price:adData[index].price,
                        priceNegotiable:adData[index].price,
                        image

                    });
            }

            res.json({adsList, total});

    },
    getItem:async(req, res)=>{

        let {id, other = null} = req.query;
        if(!id){
            res.json({error:'Sem Produto'});
            return;
        }
        if(id.length < 24){
            res.json({error:'ID Invalido'});
            return;
        }

        const ad = await Ad.findById(id);
        if(!ad){
            res.json({error:'Produto Inexistente'});
            return;
        }
        ad.views++;
        await ad.save();
        let images = [];
        for(let posicao in ad.images){
                images.push(`${process.env.BASE}/media/${ad.images[posicao].urlNewName}`);
        }
            let category  = await Category.findById(ad.category).exec();
            let userInfo  = await User.findById(ad.idUser).exec();
            let stateInfo  = await State.findById(ad.state).exec();
            let others = [];
            if(other){
                const otherData = await Ad.find({status: true, idUser:ad.idUser}).exec();
                for(let index in otherData){
                    if(otherData[index]._id.toString() != ad._id.toString()){
                        let image = `${process.env.BASE}/media/default.jpg`;
                        let defaultImg = otherData[index].images.find(e=>e.default);
                        if(defaultImg){
                            image = `${process.env.BASE}/media/${defaultImg.urlNewName}`;
                        }

                        others.push({
                            id:otherData[index]._id,
                            title:otherData[index].title,
                            price:otherData[index].prece,
                            priceNegotiable:otherData[index].priceNegotiable,
                            image
                        });
                    }

                } 
            }
            res.json({
                id:ad._id,
                title:ad.title,
                price:ad.prece,
                priceNegotiable:ad.priceNegotiable,
                dataCreated:ad.dataCreated,
                views: ad.views,
                images,
                category,
                userInfo:{
                    name:userInfo.name,
                    email:userInfo.email
                },
                stateName:stateInfo.name,
                others
            });
        },
    editAction:async(req, res)=>{

        let {id} = req.params;
        let {title, status, price, priceneg, desc, cat, images, token} = req.body;

        if(id.length < 24){
            res.json({error: 'ID Invalido'});
            return;
        }
        const ad = await Ad.findById(id).exec;
        if(!ad){
            res.json({error:'Anuncio não existe!'});
            return;
        }
        const user  = await User.findOne({token}).exec();
        if(user._id.toString() != ad.idUser){
            res.json({error: 'Este anuncio não é seu!'});
            return;
        }
        
        let updates = {};

        if(title){
            updates.title = title
        }
        if(price){
            price = price
            .replace('.', '')
            .replace(',', '.')
            .replace('R$ ', '');
           price = parseFloat(price);

           updates.price = price;
        }
        if(priceneg){
            updates.priceNegotiable = priceneg
        }
        if(status){
            updates.status = status;
        }
        if(desc){
            updates.description = desc;
        }
        if(cat){
            const category =  await Category.findOne({slug: cat}).exec();
            if(!category){
                res.json({error: 'Categoria não existe'});
                return;
            }
            updates.category = category._id.toString();
        }
        if(images){
            updates.images = images;
        }
        await Ad.findByIdAndUpdate(id, {$set: updates});
        if(req.files && req.files.img){
            const adI = await Ad.findById(id);
            if(['image/jpeg','image/jpg','image/png'].includes(req.files.img.mimetype)){
                let urlNewName = await addImage(req.files.img.data);
                adI.images.push({
                    urlNewName,
                    default:false
                });
            }
                else{
                    for(let index = 0; index < req.files.img.length; index++){
                        if(['image/jpeg','image/jpg','image/png'].includes(req.files.img[index].mimetype)){
                            let urlNewName = await addImage(req.files.img[index].data);
                            adI.images.push({
                                urlNewName,
                                default:false
                            });
                        }


                }
            }
            adI.images = [...adI.images];
            await adI.save();
        }
        res.json({error: ''});
    }
};