const express = require('express');
const router = express.Router();
const db = require("../public/js/db.js");
const database = require("../models/database")

router.get("/", (request, response) => {

    response.render("index", {
        title: "Fork n' Spoon",
        data: database.getAllTopMeals()
    })
});

router.get("/package", (request, response) => {

    response.render("package", {
        title: "All Package Listing",
        data: database.getAllPackage()
    })
});

router.get("/welcome", (request, response) => {

    response.render("welcome", {
        title: "Welcome",
    })
});

router.get("/signin", (request, response) => {
    response.render("signin", {
        title: "Sign In",
    })
});

router.post("/signin", (request, response) => {
    if (request.body.submit == "Sign Up") {
        db.addUser(request.body).then(() => {

            const { fnameup, lnameup, emailup, passwordup } = request.body;

            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            const msg = {
                to: `${emailup}`,
                from: 'qpham4@myseneca.ca',
                subject: "Fork'n Spoon Customer Registeration",
                // text: 'and easy to do anywhere, even with Node.js',
                html: `Welcome ${fnameup} to Fork'n Spoon. We hope you'll enjoy our wonderful service.<br>
        Customer Full Name: ${fnameup} ${lnameup}<br>
        Customer Email: ${emailup}<br>
        Customer Password: ${passwordup}`,
            };
            sgMail.send(msg)
                .then(() => {
                    response.redirect("/welcome");
                })
                .catch(err => {
                    console.log(`Error ${err}`);
                })
        }).catch((err) => {
            console.log("Error adding user: " + err);
            response.redirect("/signin");
        })
    }else{
        
    }
});

module.exports = router;