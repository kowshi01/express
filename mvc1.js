//simple product contact and success 
//controller/product&success

const path=require('path');
const rootDir=require('../util/path');

exports.getContact=(req,res,next)=>{
    res.sendFile(path.join(rootDir,'views','contactus.html'));
}

exports.postSuccess=(req,res,next)=>{
    res.sendFile(path.join(rootDir,'views','success.html'));
}

//routes/contact
const express =require('express');
const contactController=require('../controller/contactus');
const router=express.Router();

router.get('/contactus', contactController.getContact);

router.post('/success', contactController.postSuccess);

module.exports=router;

//mvc new project addproduct getproduct
//controller/product

const products = [];

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
    products.push({ title: req.body.title });
    res.redirect('/');
  }

  exports.getProduct=(req, res, next) => {
    res.render('shop', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  }
  
  //controller/error
  
  exports.get404=(req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' });
  }
  
  
  //routes/admin.js
  const path = require('path');

const express = require('express');

const productController = require('../controller/product');

const router = express.Router();


 //admin/add-product => GET
router.get('/add-product', productController.getAddProduct);

 //admin/add-product => POST
router.post('/add-product', productController.postAddProduct);
module.exports = router;


//routes/shop.js

const path = require('path');

const express = require('express');

const productController = require('../controller/product');

const router = express.Router();

router.get('/', productController.getProduct);

module.exports = router;


//app.js
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controller/error');

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


