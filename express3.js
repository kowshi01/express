//app.js
const express =require('express');
const bodyParser = require('body-parser');

const app=express();
const adminRouter=require('./routes/admin');
const shopRouter=require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));

app.use('/admin' , adminRouter);
app.use('/shop',shopRouter);

app.use((req,res,next)=>{
    res.status(404).send('<h2>Page not found</h2>');
})

app.listen(3000);

//routes/admin.js

const express =require('express');
const router=express.Router();

router.get('/add-product',(req,res,next)=>{
    res.send('<form action="/admin/product" method="post"><input type="text"name="title"><input type="number" name="size"><button type="submit">AddProduct</button></form>') 
});
router.post('/product',(req,res,next)=>{
    console.log(req.body);
    res.redirect('/shop');
});

module.exports=router;

//routes/shop.js

const express =require('express');
const router=express.Router();

router.get('/',(req,res,next)=>{
    res.send('<h1> hello to Express js </h1>');
});

module.exports=router;
