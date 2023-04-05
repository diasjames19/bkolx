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

    },
    getList:async(req, res)=>{

    },
    getItem:async(req, res)=>{

    },
    editAction:async(req, res)=>{

    }
};