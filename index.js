const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t1zteu1.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const paintingCollection = client.db('paintingDB').collection('painting');
    const categoryCollection = client.db('paintingDB').collection('category');
    const userCraftCollection = client.db('paintingDB').collection('userCraft');

    app.get("/painting", async(req, res)=> {
        const cursor = paintingCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get("/painting/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await paintingCollection.findOne(query);
      res.send(result);
    });
    // --------------
    // app.get("/userCraft/:email", async(req, res) => {
    //   const email = req.params.email;
    //   const query = {email: email}
    //   const result = await userCraftCollection.findOne(query);
    //   res.send(result);
    // });
    // app.post('/userCraft', async(req, res) => {
    //   const {body} = req;
    //   const result = await userCraftCollection.insertOne(body);
    //   res.send(result);
    // })
    app.get("/userCraft/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const results = await userCraftCollection.find(query).toArray();
        res.send(results);
      } catch (error) {
        console.error("Error fetching userCraft:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    
    app.post("/userCraft", async (req, res) => {
      try {
        const { body } = req;
        const result = await userCraftCollection.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error("Error inserting userCraft:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    
    // ---------------
    app.post('/painting', async(req, res) => {
        const newCraft = req.body;
        console.log(newCraft);
        const result = await paintingCollection.insertOne(newCraft);
        res.send(result);
    });

    app.put("/painting/:id", async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateCraft = req.body;
      const painting = {
          $set: {
            name: updateCraft.name, 
            email: updateCraft.email,
            item_name: updateCraft.item_name,
            subcategory_name: updateCraft.subcategory_name ,
            customization: updateCraft.customization ,
            stock: updateCraft.stock ,
            processing_time: updateCraft.processing_time ,
            price: updateCraft.price ,
            rating: updateCraft.rating ,
            short_description: updateCraft.short_description ,
            image: updateCraft.image 
          }
      }
      const result = await paintingCollection.updateOne(filter, painting, options);
      res.send(result);
    });
    // -------------------------------
    app.get("/category", async(req, res)=> {
        const cursor = categoryCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get("/category/:id", async(req, res)=> {
      const {id} = req.params
      const category = id.split('&').join(' ')
      
        const cursor = paintingCollection.find({
          subcategory_name:category
          })
        const result = await cursor.toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Web Server is running')
})

app.listen(port, () => {
    console.log(`Web Server is running on port: ${port}`);
})