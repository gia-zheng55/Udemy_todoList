const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// mongosh "mongodb+srv://atlascluster.tughnav.mongodb.net/myFirstDatabase" --apiVersion 1 --username admin-gia

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({entended:true}));
app.use(express.static("public"));

let week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
"Friday", "Saturday"];

mongoose.connect("mongodb+srv://admin-gia:udemy123@atlascluster.tughnav.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Buy milk"
});

const item2 = new Item({
  name: "Buy shampoo"
});

const item3 = new Item({
  name: "Buy candy"
});

const defaultItems = [item1, item2, item3];

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){
    if(err){
      console.log(err);
    }else{
      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Successfully insert default items to DB");
          }
        });
        res.redirect("/");
      }else{
        res.render("list", {listTitle:"Today", items:foundItems});
      }
    }
  })
})

app.get("/:paramName", function(req, res){
  const paramName = _.capitalize(req.params.paramName);

  List.findOne({name: paramName}, function(err, foundItems){
    if(!err){
      if(!foundItems){
        const list = new List({
          name: paramName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + paramName);
      }else{
        res.render("list", {listTitle:paramName, items:foundItems.items});
      }
    }
  });
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
})

app.get("/about", function(req, res){
  res.render("about");
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;

  if(req.body.list === "Work List"){
    workItems.push(item);
    res.redirect("/work");
  }else{
    const item = new Item({
      name: itemName
    });
    item.save();
    res.redirect("/");
  }
})

app.post("/delete", function(req, res){
  var itemID = req.body.checkbox;
  var listName = _.capitalize(req.body.listName);

  if(listName === "Today"){
    Item.findByIdAndRemove(itemID, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully delete this item");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}},
      function(err, foundList){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully delete this item");
        res.redirect("/" + listName);
      }
    });
  }
})

app.post("/work", function(req, res){
  var item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started successfully");
})
