const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.mi2xoxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    const E_Dokan_DB = client.db("E-Dokan").collection("AllProducts");
    // Assuming you're using MongoDB native driver with Express.js

    app.get("/allProduct", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const searchValue = req.query.search || "";
        const priceValue = req.query.priceValue === "true";
        const dateValue = req.query.datevalue === "asc" ? 1 : -1;

        // Build the search query if searchValue is provided
        let query = {};
        if (searchValue.trim() !== "") {
          query = {
            product_name: { $regex: new RegExp(searchValue, "i") },
          };
        }

        // Determine sorting options
        let sortOptions = {};
        if (priceValue) {
          sortOptions.product_price = 1; // Low to High
        } else {
          sortOptions.product_price = -1; // High to Low
        }
        sortOptions.date = dateValue; // Sort by date (ascending or descending)
        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch the total number of documents that match the query
        const totalDocuments = await E_Dokan_DB.countDocuments(query);

        // Fetch the documents with pagination, search query, and sorting applied
        const products = await E_Dokan_DB.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .toArray();
        // Send the response with products, totalPages, and currentPage
        res.json({
          products,
          totalPages: Math.ceil(totalDocuments / limit),
          currentPage: page,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
