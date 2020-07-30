const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let userSchema = new Schema({
    "email": {
        "type": String,
        "unique": true
    },
    "password": String,
    "firstName": String,
    "lastName": String
});

let Users;

//check if database is connected before listenging to port
module.exports.initialize = function(){
    return new Promise((resolve, reject)=>{
        let db = mongoose.createConnection(process.env.MONGOOSECONNECTION,{ useNewUrlParser: true, useUnifiedTopology: true });
        
        db.on('error', (err)=>{
            reject(err);
        });

        db.once('open', ()=>{
            Users = db.model("users", userSchema);
            resolve();
          });
    });
}

module.exports.addUser = function(data){
    return new Promise((resolve,reject)=>{
        //prep the incoming data 
        console.log(data);
        //set data to null if an empty string ""
        for (var formEntry in data){
            if (data[formEntry] == "") 
                data[formEntry] = null;
        }

        //add data
        var newUser = new Users({
            email: data.emailup,
            password: data.passwordup,
            firstName: data.fnameup,
            lastName: data.lnameup
        });

        newUser.save((err)=>{
            if (err){
                console.log("There was an error: "+err);
                reject();
            }
            else{
                console.log("Saved that users: "+data.fnameup+" "+data.lnameup);
                resolve();
            }
        });
    });
}