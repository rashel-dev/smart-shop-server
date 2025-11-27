const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0ocgkty.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

app.get("/", (req, res) => {
    res.send("Welcome to the Smart Shop BD!");
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        const database = client.db(`${process.env.DB_NAME}`);
        const productsCollection = database.collection("products");

        // Get all products
        app.get("/products", async (req, res) => {
            try {
                const cursor = productsCollection.find({});
                const products = await cursor.toArray();
                res.send(products);
            } catch (error) {
                console.error("Error fetching products:", error);
                res.status(500).json({ error: "Failed to fetch products" });
            }
        });

        // Get single product by ID
        app.get("/products/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const product = await productsCollection.findOne(query);

                if (!product) {
                    return res.status(404).json({ error: "Product not found" });
                }

                res.send(product);
            } catch (error) {
                console.error("Error fetching product:", error);
                res.status(500).json({ error: "Failed to fetch product" });
            }
        });

        // Add new product
        app.post("/products", async (req, res) => {
            try {
                const product = req.body;

                // Validate required fields
                if (!product.title || !product.price || !product.category) {
                    return res.status(400).json({ error: "Missing required fields" });
                }

                const result = await productsCollection.insertOne(product);
                res.status(201).json(result);
            } catch (error) {
                console.error("Error adding product:", error);
                res.status(500).json({ error: "Failed to add product" });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Smart Shop BD is running on port ${port}`);
});
