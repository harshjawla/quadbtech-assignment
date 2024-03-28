require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();
app.set('view engine', 'ejs');

const URL= process.env.MONGODB_DATABASE_URL;
const APIURL = process.env.WAZIRX_URL;

mongoose.connect(URL);

function formatNumber(number) {
    return (new Intl.NumberFormat("en-IN").format(number));
}


// name, last, buy, Sell, volume, base_unit
const CryptoSchema = new mongoose.Schema({
    name: String,
    last: String,
    buy: String,
    sell: String,
    volume: Number,
    base_unit: String,
});

const Crypto = new mongoose.model("Crypto", CryptoSchema);


const PORT = 3000;


app.get("/", async (req, res) => {
    await fetch("http://localhost:3000/update",{
        method: "POST",
    });
    const response = await Crypto.find();
    res.render("index", { data: response });
});

app.post("/update",async (req,res) => {
    await Crypto.deleteMany({});
    const response = await fetch(APIURL);
    const data = await response.json();
    let count = 0;
    for (const key in data) {
        if (count >= 10) break;
        const curr = await Crypto.create({
            name: data[key].name,
            last: "₹ " + formatNumber(Math.floor(data[key].last)),
            buy: "₹ " + formatNumber(Math.floor(data[key].buy)),
            sell: "₹ " + formatNumber(Math.floor(data[key].sell)),
            volume: data[key].volume,
            base_unit: data[key].base_unit,
        });
        count++;
    }
    res.json("ok");
})

app.listen(3000, async () => {
    // console.log(Object.keys(data).length);
    console.log(`Server started on port ${PORT}.`)
});
