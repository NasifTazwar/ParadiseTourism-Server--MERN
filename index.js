const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qurrs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('online_tourism');
        const tourismPackageCollection = database.collection('packages');
        const userOrderCollection = database.collection('orders');


        // GET PACKAGES
        app.get('/packages' , async(req , res)=>{
            const cursor = tourismPackageCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });

        // Add PACKAGES
        app.post('/addpackages' , async(req , res)=>{
            console.log(req.body);
            const result = await tourismPackageCollection.insertOne(req.body);
            res.send(result);
        });
        
        // POST API
        app.post('/userorders' , async(req , res)=>{
            console.log(req.body);
            const result = await userOrderCollection.insertOne(req.body);
            res.send(result);
        });


        // manage all orders
        app.get('/manageallorders' , async(req , res)=>{
            const cursor = userOrderCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        });

        // Delete Order
        app.delete("/deleteorder/:id" , async(req , res)=>{
            // console.log(req.params);
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await userOrderCollection.deleteOne(query);
            res.json(result);
        });
        
        // UPDATE pending
        app.put('/updateorder/:id' , async(req , res)=>{
            const id = req.params.id;
            const updatedorder = req.body;
            const filter ={ _id: ObjectId(id)};
            const updateDoc = {
                $set:{
                    status: "Confirmed",
                },
            };
            const result = await userOrderCollection.updateOne(filter , updateDoc);
            res.json(result);
        });

        // My Orders

        app.get('/myorders/:email' , async(req , res)=>{
            const result = await userOrderCollection.find({email: req.params.email}).toArray();
            res.send(result);
        })

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/' , (req , res)=>{
    res.send('server running');
});

app.listen(port , ()=>{
    console.log('Port' , port);
});