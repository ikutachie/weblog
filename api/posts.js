var {CONNECTION_URL,OPTIONS,DATABASE} =require("../config/mongodb.config.js");
var router = require("express").Router();
var MongoClient = require("mongodb").MongoClient;

router.get("/*", (req, res)=>{
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error,client)=>{
    var db = client.db(DATABASE);
    db.collection("posts").findOne({
      url: req.url
    },{
      progection: {_id: 0}
    
    }).then((doc)=>{
      res.json(doc);
    }).catch((error)=>{
      throw error;
    }).then(()=>{
      client.close();
    });
  });
});

module.exports = router;