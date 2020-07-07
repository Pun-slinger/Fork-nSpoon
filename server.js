const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require('body-parser');


require('dotenv').config({path:"./config/keys.env"});

const { request, response } = require("express");

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static("public"));

//load controllers
const generalController = require("./controllers/general");

//map each controller to the app object
app.use("/",generalController);


const port = process.env.PORT;
app.listen(port, () => {
    console.log("Web server running successful");
});


