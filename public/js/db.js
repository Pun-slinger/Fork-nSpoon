const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    "email": {
        "type": String,
        "unique": true
    },
    "password": String,
    "firstName": String,
    "lastName": String,
    "admin": Boolean,
    "img": String
});

let packageSchema = new Schema({
    "name": {
        "type": String,
        "unique": true
    },
    "price": Number,
    "desc": String,
    "mealNum": Number,
    "display": Boolean,
    "url": String
})

let Users;
let Packages;

//check if database is connected before listening to port
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGOOSECONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });

        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            Users = db.model("users", userSchema);
            Packages = db.model("packages", packageSchema);
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
            admin: false,
            img: data.urlup
        });
        
        //var newUser = new Users(data);

        bcrypt.genSalt(10)
            .then(salt => bcrypt.hash(newUser.password, salt))
            .then(hash => {

                newUser.password = hash;

                newUser.save((err) => {
                    if (err) {
                        if (err.code = 11000) {
                            reject("Duplicate Email entered");
                        }
                        else {
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
    })
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
                bcrypt.compare(data.passwordin, returnedUsers[0].password).then((result) => {
                    if (result) {
                        resolve(returnedUsers);
                    }
                    else {
                        reject("Password don't match");
                        return;
                    }
                });
            }).catch((err) => {
                reject(err);
                return;
            });
        }
    });
}

module.exports.addPackage = function (data) {
    return new Promise((resolve, reject) => {

        data.packageDisplay = (data.packageDisplay) ? true : false;

        data.packageImageUrl = (data.packageImageUrl) ? data.packageImageUrl : "/img/noimage.jpg";

        for (var formEntry in data) {
            if (data[formEntry] == "")
                data[formEntry] = null;
        }

        //add package
        var newPackage = new Packages({
            name: data.packageName,
            price: data.packagePrice,
            desc: data.packageDesc,
            mealNum: data.packageMealNum,
            display: data.packageDisplay,
            url: data.packageImageUrl
        });

        newPackage.save((err) => {
            if (err) {
                if (err.code = 11000) {
                    reject("Duplicate Package Name entered");
                }
                else {
                    console.log("There was an error: " + err);
                    reject(err);
                }
            }
            else {
                console.log("Saved that package: " + data.packageName);
                resolve();
            }
        });
    });
}

module.exports.getPackage = function () {
    return new Promise((resolve, reject) => {
        Packages.find()
            .exec()
            .then((returnedPackage) => {
                resolve(returnedPackage.map(item => item.toObject()));
            }).catch((err) => {
                console.log("Error Retriving Packages:" + err);
                reject(err);
            });
    });
}

module.exports.getPackagesByName = function (inName) {
    return new Promise((resolve, reject) => {
        //email has to be spelled the same as in the data base
        Packages.find({ name: inName }) //gets all and returns an array. Even if 1 or less entries
            .exec() //tells mongoose that we should run this find as a promise.
            .then((returnedPackage) => {
                if (returnedPackage.length != 0)
                    resolve(returnedPackage.map(item => item.toObject()));
                else
                    reject("No Packages found");
            }).catch((err) => {
                console.log("Error Retriving packages:" + err);
                reject(err);
            });
    });
}

module.exports.getPackagesByDisplay = function (inDisplay) {
    return new Promise((resolve, reject) => {
        //email has to be spelled the same as in the data base
        Packages.find({ display: inDisplay }) //gets all and returns an array. Even if 1 or less entries
            .exec() //tells mongoose that we should run this find as a promise.
            .then((returnedPackage) => {
                if (returnedPackage.length != 0)
                    resolve(returnedPackage.map(item => item.toObject()));
                else
                    reject("No Packages found");
            }).catch((err) => {
                console.log("Error Retriving packages:" + err);
                reject(err);
            });
    });
}

module.exports.editPackage = (editData) => {
    return new Promise((resolve, reject) => {
        editData.packageDisplay = (editData.packageDisplay) ? true : false;
        editData.packageImageUrl = (editData.packageImageUrl) ? editData.packageImageUrl : "/img/noimage.jpg";

        Packages.updateOne(
            { name: editData.packageName }, //what do we updateBy/How to find entry
            {
                $set: {  //what fields are we updating
                    name: editData.packageName,
                    price: editData.packagePrice,
                    desc: editData.packageDesc,
                    mealNum: editData.packageMealNum,
                    display: editData.packageDisplay,
                    url: editData.packageImageUrl
                }
            })
            .exec() //calls the updateOne as a promise
            .then(() => {
                console.log(`Package ${editData.packageName} has been updated`);
                resolve();
            }).catch((err) => {
                reject(err);
            });
    });
}

module.exports.deletePackageByName = (name) => {
    return new Promise((resolve, reject) => {
        Packages.deleteOne({ name: name })
            .exec()
            .then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            })
    });
}