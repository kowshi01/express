//app.js
const express =require('express');
const app=express()
app.use((req,res,next)=>{
    console.log("middleware 1");
    next();    
});
app.use((req,res,next)=>{
    res.send('<h1> hello to node js </h1>');
    console.log("middleware 2");
});
app.listen(3000);
