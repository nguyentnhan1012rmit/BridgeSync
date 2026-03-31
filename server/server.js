const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions))
app.use(express.json())
// All routes here
app.get('/', (req,res) => {
    res.send("Hello world from backend")
})


app.listen(3000, () => console.log("Server started on ", process.env.PORT))
