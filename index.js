import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

mongoose.connect("mongodb+srv://brunoikarimoto:batata123@cluster0.fxho0xm.mongodb.net/ToDoList", {
    useNewUrlParser: true
});

const itemSchema = mongoose.Schema({
    name: String,
    mode: {
        type: String,
        enum: ["Daily", "Work"],
        required: true
    },
    check: {
        type: Boolean,
        default: false
    }
});

const Item = mongoose.model("Item", itemSchema);

const app = express();
const port = 3000;

let activeList;

let now = new Date();
let dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    activeList = 0;

    const items = await Item.find({mode: "Daily"});

    res.render("index.ejs", {
        type: "Daily",
        weekDay: dayName[now.getDay()],
        day: now.getDate(),
        month: monthName[now.getMonth()],
        tasks: items
    });
});

app.get("/work", async (req, res) => {
    activeList = 1;

    const items = await Item.find({mode: "Work"});

    res.render("index.ejs", {
        type: "Work",
        weekDay: dayName[now.getDay()],
        day: now.getDate(),
        month: monthName[now.getMonth()],
        tasks: items
    });
});

app.post("/submit", async (req, res) => {
    let name = req.body.item;

    if(activeList === 0){
        const item = new Item({
            name: name,
            mode: "Daily"
        });
        item.save();
        res.redirect("/");
    }
    else{
        const item = new Item({
            name: name,
            mode: "Work"
        });
        item.save();
        res.redirect("/work");
    }
});

app.post("/delete", async (req, res) => {
    const id = req.body.delete;

    await Item.findByIdAndDelete(id);

    if(activeList === 0){
        res.redirect("/");
    }
    else{
        res.redirect("/work");
    }
});

app.get("/check/:id", async (req, res) => {
    const id = req.params.id;

    const item = await Item.findOne({_id: id});

    if(item.check === false){
        item.check = true;
    }
    else{
        item.check = false;
    }

    await Item.updateOne({_id: id}, item);

    if(activeList === 0){
        res.redirect("/");
    }
    else{
        res.redirect("/work");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});