const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;
const Product = require('../models/product');
const { validationResult } = require('express-validator');
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError:false,
        errorMessage:null,
        validationErrors:[],
        isAuthenticated: req.session.isLoggedIn
        
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const ImageURL = req.body.ImageURL;
    const discount=req.body.discount;
    const Price = req.body.Price;
    const description = req.body.description;
    const freedelivery=req.body.freedelivery;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
     return   res.status(422).render('admin/edit-product',{
            path:'/admin/edit-product',
            pageTitle:'Edit-Product',
            editing:false,
            hasError:true,
            product:{
                title:title,
                ImageURL:ImageURL,
                discount:discount,
                Price:Price,
                description:description,
                freedelivery:freedelivery
            },
            errorMessage:errors.array()[0].msg,
            validationErrors:errors.array()
        })
    }
   const product= new Product({
    title:title,
    ImageURL:ImageURL,
    Price:Price,
    discount:discount,
    description:description,
    freedelivery:freedelivery,
    userId: req.user
});
   product
   .save()
   .then(result => {
    // console.log(result);
    console.log("Created Product");
    res.redirect('/admin/products');
})
.catch(err => { 
    console.log(err) 
});
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
   Product.findById(prodId)
    .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                hasError:false,
                errorMessage:null,
                product: product,
                validationErrors:[],
                isAuthenticated: req.session.isLoggedIn
            })
         })
    .catch((erro)=>{console.log(erro);});
};


exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.ImageURL;
    const updatedDiscount=req.body.discount;
    const updatedPrice = req.body.Price;
    const updatedDesc = req.body.description;
    const updatedFree=req.body.freedelivery;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(422).render('admin/edit-product',{
            path:'/admin/edit-product',
            pageTitle:'Edit Product',
            editing: false,
            hasError:true,
            product:{
                title: updatedTitle,
                ImageURL:updatedImageUrl,
                discount:updatedDiscount,
                Price:updatedPrice,
                description:updatedDesc,
                freedelivery:updatedFree
            },
            errorMessage:errors.array()[0].msg,
            validationErrors:errors.array()
            
        })
    }
   Product.findById(prodId)
   .then(product => {
    if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
    }
        product.title = updatedTitle;
        product.ImageURL = updatedImageUrl;
        product.discount = updatedDiscount;
        product.Price = updatedPrice;
        product.description = updatedDesc;
        product.freedelivery = updatedFree;
        return product.save()
    })
    .then(result=>{
        console.log('updated product')
        res.redirect('/admin/products');
    })
    .catch((erro)=>{console.log(erro)});
}

exports.getProducts = (req, res, next) => {
   Product.find({userId: req.user._id})
   .then(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
            isAuthenticated: req.session.isLoggedIn
        });

}).catch((erro)=>{console.log(erro);});
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.DeleteOne({_id:prodId ,userId:req.user._id})
    .then(()=>{
        console.log('DESTROY PRODUCT')
        res.redirect('/admin/products');
    })
    .catch((erro)=>{console.log(erro);});
  

}