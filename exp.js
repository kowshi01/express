//app.js
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const db =require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);

//shop.js/controller
const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(([rows])=>{
    res.render('shop/product-list', {
      prods: rows,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err=>console.log(err))
  
};

exports.getProduct=(req,res,next)=>{
  const prodId=req.params.productId;
  Product.findById(prodId)
  .then(([product])=>{
    res.render('shop/product-detail' , {
      product: product[0], 
      pageTitle: product.title , 
      path: '/products'
    });
  })
  .catch(err=>console.log(err))
  
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
  .then(([rows,fieldData])=>{
    res.render('shop/index', {
      prods: rows,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err=>console.log(err));
};

exports.getCart = (req, res, next) => {
  Cart.getCart(cart=>{
    Product.fetchAll(products=>{
      const cartProducts=[];
      for(let product of products){
        const cartProductData=cart.products.find(prod=> prod.id===product.id);
        if(cartProductData){
            cartProducts.push({productData: product , qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
};

exports.postCart=(req,res,next)=>{
  const prodId=req.body.productId;
  Product.findById(prodId , (product)=>{
    Cart.addProduct(prodId , product.price);
  });
  res.redirect('/cart');
}

exports.postCartDeleteProduct=(req,res,next)=>{
  const prodId=req.body.productId;
  Product.findById(prodId,product=>{
    Cart.deleteProduct(prodId,product.price);
    res.redirect('/cart');
  })
}
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
//admin.js/controller
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null, title, imageUrl, price, description);
  product.save()
  .then(()=>{
    res.redirect('/');
  })
  .catch(Err=>console.log(Err));
  
};

exports.getEditProduct = (req, res, next) => {
  const editMode=req.query.edit;
  if(!editMode){
   return res.redirect('/');
  }
  const prodId=req.params.productId;
  Product.findById(prodId, product=>{
    if(!product){
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
};

exports.postEditProduct=(req,res,next)=>{
  const prodId=req.body.productId;
  const updatedtitle=req.body.title;
  const updatedimageUrl=req.body.imageUrl;
  const updatedprice=req.body.price;
  const updateddescription=req.body.description;
  const updatedProduct=new Product(
      prodId,
      updatedtitle,
      updatedimageUrl,
      updatedprice,
      updateddescription
  );
  console.log(updatedprice);
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};


exports.postDeleteProduct=(req,res,next)=>{
  const prodId=req.body.productId;
  Product.deleteById(prodId)
  .then(()=>{
    res.redirect('/admin/products');
  })
  .catch(Err=>console.log(Err));
}
//product.js/model
const Cart=require('./cart');
const db=require('../util/database');
module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id=id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }

  save() {
    return db.execute('insert into products(title, imageUrl, price, description) values(?, ?, ?, ?)',
    [this.title, this.imageUrl, this.price, this.description]
    );
  }

  static deleteById(id){
    return db.execute('delect from products where products.id=?',[id]);
  }

  static fetchAll() {
    return db.execute('select * from products');
  }

  static findById(id){
    return db.execute('select * from products where products.id=?',[id]);
}
}
