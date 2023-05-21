const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c1nhv4b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCategoryCollection = client
      .db("activeToy")
      .collection("toy-categories");
    const toyCollection = client.db("activeToy").collection("toys");

    app.get("/toy-categories", async (req, res) => {
      const result = await toyCategoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          toy_price: updatedToy.toy_price,
          toy_quantity: updatedToy.toy_quantity,
          toy_description: updatedToy.toy_description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/my-toys", async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query.email) {
        query = { seller_email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Active Toy Is Running");
});

app.listen(port, () => {
  console.log(`Active Toy Is Running On Port: ${port}`);
});
