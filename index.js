const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();
// middeleware
app.use(cors()); // for crose origin access
app.use(express.json()); //for body parse

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(req.headers);
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

// mongodb connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jnjsa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db("Simple-Todo").collection("task");

    // apis
    app.post("/task", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });
    app.get("/task", async (req, res) => {
      const query = {};
      const cursor = taskCollection.find(query);
      const task = await cursor.toArray();
      res.send(task);
    });

    app.put("/task/:id", async (req, res) => {
      const id = req.params.id;
      const dataStatus = req.body;
      const filter = { _id: ObjectId(id) };
      console.log(dataStatus, id);
      const result = taskCollection.updateOne(
        filter,
        { $set: dataStatus },
        { upsert: true }
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

// test api
app.get("/", (req, res) => {
  res.send("Todo-app server is running");
});

// listen the port
app.listen(port, () => {
  console.log("Todo-app server is running .");
});
