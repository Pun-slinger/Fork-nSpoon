const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require('body-parser');
const app = express();
const db = require("./public/js/db.js");
//load controllers
const generalController = require("./controllers/general");
const { request, response } = require("express");
require('dotenv').config({ path: "./config/keys.env" });

var currentUser = {
    email = "",
    password = "",
    firstName = "",
    lastName = "",
    loggedIn = false
};

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"));
//map each controller to the app object
app.use("/", generalController);
app.use(/*missing route*/(req, res) => {    //use as a catch all routes
    res.status(404).send("<h3 style='color:red'>Page Not Found</h3>");
});

const port = process.env.PORT;
function onHttpStart() {
    console.log("Express http server listening on: " + port);
}

db.initialize().then(() => {
    console.log("Data read successfully");
    app.listen(port, onHttpStart);

})
    .catch((data) => {
        console.log(data);
    });

