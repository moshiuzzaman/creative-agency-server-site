const express = require('express')
require('dotenv').config()
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const cors = require('cors');
const { ObjectId } = require('mongodb');
const port = 4000
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ki0s6.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(fileUpload());


client.connect(err => {
    const orderCollection = client.db(`${process.env.DB_USER}`).collection("order");
    const reviewCollection = client.db(`${process.env.DB_USER}`).collection("review");
    const servicesCollection = client.db(`${process.env.DB_USER}`).collection("services");
    const adminCollection = client.db(`${process.env.DB_USER}`).collection("admin");
    app.post('/addOrder', (req, res) => {
        const orderedService = req.body
        orderCollection.insertOne(orderedService)
            .then(result => res.send(result.insertedCount > 0))
    })
    app.get('/orderdServices', (req, res) => {
        const userEmail = req.query.email;
        orderCollection.find({ userEmail: userEmail })
            .toArray((err, result) => res.send(result))
    })
    app.get('/allOrderdServices', (req, res) => {
        orderCollection.find()
            .toArray((err, result) => res.send(result))
    })
    
    app.post('/addReview', (req, res) => {
        const review =req.body
        reviewCollection.insertOne(review)
            .then(result => res.send(result.insertedCount > 0))
    })
    app.post('/addAdmin', (req, res) => {
        const admin =req.body
        adminCollection.insertOne(admin)
            .then(result => res.send(result.insertedCount > 0))
    })
    app.get('/admin', (req, res) => {
        const userEmail = req.query.email;
        adminCollection.find({ email: userEmail })
            .toArray((err, result) => res.send(result))
    })
    
    app.post('/addService', (req, res) => {
        const file = req.files.file
        const title = req.body.title
        const details = req.body.email
        const newImg = file.data;
        const encImg = newImg.toString('base64');
    
        var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ title, details, image })
          .then(result => res.send(result.insertedCount > 0))
      })
      app.get('/services',(req,res)=>{
          servicesCollection.find()
          .toArray((err, result)=>res.send(result))
      })
      app.get('/reviews',(req,res)=>{
          reviewCollection.find()
          .toArray((err, result)=>res.send(result))
      })
      app.patch('/updateStatus/:id',(req, res) => {
        const id=req.params.id
        orderCollection.updateOne({ _id:ObjectId(id) },
            { $set: { status: req.body.value},
               })
               .then(result =>res.send(result.modifiedCount>0))
      })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`${port} is running`)
})