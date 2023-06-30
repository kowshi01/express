//app.js
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const Product=require('./models/product');
const User=require('./models/user');
const Cart=require('./models/cart');
const CartItem=require('./models/cart-item');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
User.findByPk(1)
.then(user=>{
    req.user=user;
    next();
})
.catch(err=>console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints : true ,onDelete : 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product ,{through : CartItem});
Product.belongsToMany(Cart ,{through : CartItem});


sequelize
.sync()
.then(res=>{
    return User.findByPk(1);
})
.then(user=>{
    if(!user){
        return User.create({name: 'ABC' , emailid:'ABC@gmail.com'});
    }
    return user;
})
.then((user)=>{
    return user.createCart();
})
.then(cart=>{
    app.listen(3000);
})
.catch(err=>console.log(err));
//cart.js/model
const Sequelize=require('sequelize');
const sequelize=require('../util/database');

const Cart=sequelize.define('cart', {
  id : {
    type : Sequelize.INTEGER,
    autoIncrement : true,
    allowNull : false,
    primaryKey : true
  }
});

module.exports = Cart;

//cart-item.js/model
const Sequelize=require('sequelize');
const sequelize=require('../util/database');

const CartItem=sequelize.define('cartItem', {
  id : {
    type : Sequelize.INTEGER,
    autoIncrement : true,
    allowNull : false,
    primaryKey : true
  },
  quantity :Sequelize.INTEGER
});

module.exports = CartItem;

//shop.js
const Product = require('../models/product');
const Cart = require('../models/cart');
const User=require('../models/user');
exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err))
}

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);})
        .then(product => {
          return fetchedCart.addProduct(product, {
            through: { quantity: newQuantity }
          });
        
    })
    .then(() => {
      res.redirect('/cart');
    }).catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({where : {id :prodId}});
    })
    .then(products=>{
      const product=products[0];
      return product.cartItem.destroy();
      })
      .then(result=>{
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
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

//cart.ejs

<%- include('../includes/head.ejs') %>
    </head>

    <body>
        <%- include('../includes/navigation.ejs') %>
        <main>
            <% if(products.length > 0) { %>
                    <ul class="cart__item-list">
                        <% products.forEach(p =>{ %>
                          <li class="cart__item">
                            <h1><%= p.title %></h1>
                            <h2>Quantity : <%= p.cartItem.quantity %></h2>                   
                           <form action="/cart-delete-item" method="POST">
                            <input type="hidden" value="<%= p.id %>" name="productId">
                            <button class="btn" type="submit">Delete</button>
                           </form>
                        </li>
                        <% }) %>
                    </ul>
            <% } else { %>
                    <h1>No Products in the cart!</h1>
            <% }%>
        </main>
        <%- include('../includes/end.ejs') %>
