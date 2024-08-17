const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();


// const corsOption = {
//   origin: ["http://localhost:5173", "https://guileless-trifle-921e8c.netlify.app/"],
//   credentials: true,
//   optionSuccessStatus: 200,
// };         
app.use(cors({
  origin: 'https://guileless-trifle-921e8c.netlify.app' // Replace with your frontend domain
}));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.mi2xoxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const E_Dokan_DB = client.db("E-Dokan").collection("AllProducts");

    // Route to fetch all products
    app.get("/AllProduct", async (req, res) => {
      try {
        const {
          page = 1,
          limit = 12,
          priceValue,
          datevalue,
          search,
          category,
          brands,
          priceRange,
        } = req.query;
        console.log(datevalue);
        // Create a filter object
        const filter = {};

        // Search query (searching in 'product_name')
        if (search) {
          filter.product_name = { $regex: search, $options: "i" };
        }

        // Category filter
        if (category && category !== "") {
          filter.product_category = category;
        }

        // Brands filter
        if (brands && brands !== "") {
          const brandArray = brands.split(",");
          filter.brand_name = { $in: brandArray };
        }

        // Sorting logic
        const sort = {};
        if (priceValue) {
          sort.product_price = priceValue === "true" ? 1 : -1; // 1 for ascending, -1 for descending
        }
        if (datevalue) {
          sort.date = datevalue === "asc" ? 1 : -1; // 1 for ascending, -1 for descending
        }

        // Fetch the filtered data from the MongoDB collection
        const products = await E_Dokan_DB.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .toArray(); // Convert MongoDB cursor to an array

        // Count the total number of products
        const totalProducts = await E_Dokan_DB.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Send the response
        res.json({ products, totalPages });
      } catch (error) {
        console.error("Error fetching products:", error.message); // Log the error message
        res.status(500).json({ message: "Server Error", error: error.message });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Keeping the connection open for now
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
