const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let userSchema = new Schema({
    "email": {
        "type": String,
        "unique": true
    },
    "password": String,
    "firstName": String,
    "lastName": String,
    "admin": Boolean
});

let Users;

//check if database is connected before listening to port
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGOOSECONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            Users = db.model("users", userSchema);
            resolve();
        });
    });
}

module.exports.addUser = function (data) {
    return new Promise((resolve, reject) => {
        for (var formEntry in data) {
            if (data[formEntry] == "")
                data[formEntry] = null;
        }

        //add user
        var newUser = new Users({
            email: data.emailup,
            password: data.passwordup,
            firstName: data.fnameup,
            lastName: data.lnameup,
            admin: false
        });

        newUser.save((err) => {
            if (err) {
                if(err.code = 11000){
                    reject("Duplicate Email entered");
                }
                else{
                console.log("There was an error: " + err);
                reject(err);
                }
            }
            else {
                console.log("Saved that users: " + data.fnameup + " " + data.lnameup);
                resolve();
            }
        });
    });
}

module.exports.getUsersByEmail = function (inEmail) {
    return new Promise((resolve, reject) => {
        //email has to be spelled the same as in the data base
        Users.find({ email: inEmail }) //gets all and returns an array. Even if 1 or less entries
            .exec() //tells mongoose that we should run this find as a promise.
            .then((returnedUsers) => {
                if (returnedUsers.length != 0)
                    //resolve(filteredMongoose(returnedStudents));
                    resolve(returnedUsers.map(item => item.toObject()));
                else
                    reject("No Users found");
            }).catch((err) => {
                console.log("Error Retriving users:" + err);
                reject(err);
            });
    });
}

module.exports.validateUser = (data) => {
    return new Promise((resolve, reject) => {
        if (data) {
            this.getUsersByEmail(data.useremailin).then((returnedUsers) => {
                //get the data and check if passwords match hash
                // first is non-hashed pw, vs 2nd which is a hashed pw
                if(returnedUsers[0].password == data.passwordin){
                    resolve(returnedUsers);
                }
                else{
                    reject("Password don't match");
                    return;
                }
            }).catch((err) => {
                reject(err);
                return;
            });
        }
    });
}
