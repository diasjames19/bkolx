const Category = require('../models/category');
const Ad = require('../models/Ad')
const {validationResult, matchedData} = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

module.exports = {

    getCategories:async(req, res)=>{
        let categories = await Category.find();
        res.json({categories});
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