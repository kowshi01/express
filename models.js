//controller/product.js
const Product=require('../models/product');

exports.getAddProduct=(req, res, next) => {
    res.render('add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true
    });
  }

  exports.postAddProduct=(req, res, next) => {
    const product=new Product(req.body.title)
    product.save();
    res.redirect('/');
  }

  exports.getProduct=(req, res, next) => {
    Product.fetchAll(products=>{
      res.render('shop', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true
      });
    });
  }
  
  
  //models.product.js
  const fs=require('fs');
const path=require('path');
const p=path.join(path.dirname(process.mainModule.filename),'data','products.json');

const getProductsfromFile=(cb)=>{
    fs.readFile(p,(err,fileContent)=>{
        if(err){
            cb([]);
        }else{
        cb(JSON.parse(fileContent));
        }
});
}
module.exports=class Product{
constructor(t){
    this.title=t;
}
save(){
    getProductsfromFile(products=>{
        products.push(this);
        fs.writeFile(p,JSON.stringify(products),(err)=>{
            console.log(err);
        });
    });
}
static fetchAll(cb){
    getProductsfromFile(cb);
}
}

//fs/product.json

[{"title":"book"},{"title":"book1"},{"title":"book2"}]
