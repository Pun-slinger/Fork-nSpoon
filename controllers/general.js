const express = require('express');
const router = express.Router();
const db = require("../public/js/db.js");
const database = require("../models/database")
const clientSessions = require("client-sessions");
const { request, response } = require('express');

// Setup client-sessions
router.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "forknknife_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

router.get("/", (request, response) => {

    response.render("index", {
        title: "Fork n' Spoon",
        data: database.getAllTopMeals(),
        login: true
    })
});

router.get("/package", (request, response) => {

    response.render("package", {
        title: "All Package Listing",
        data: database.getAllPackage(),
        login: true
    })
});

router.get("/welcome", (request, response) => {
    response.render("welcome", {
        title: "Welcome",
        login: true
    })
});

function ensureSignIn(req, res, next) {
    if (!req.session.user) {
        res.redirect("/signin");
    }
    else {
        next();
    }
}

router.get("/signin", (request, response) => {
    response.render("signin", {
        title: "Sign In",
        login: true
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
            //response.redirect("/signin");
            response.render("signin", {
                title: "Sign In",
                message: err,
                login: true
            })
        })
        //User submit Sign In button instead of Sign Up
    } else {
        db.validateUser(request.body).then((data) => {
            // Add the user on the session and redirect them to the dashboard page.
            request.session.user = data;
            // logs the user in
            response.redirect("/dashboard");
            // If can't sign in due to wrong user name or password
        }).catch((err) => {
            console.log(err);
            //Display log in page with error
            response.render("signin", {
                title: "Sign In",
                message: err,
                login: true
            })
        })
    }
});

router.get("/dashboard", ensureSignIn, (request, response) => {
    //check if admin logging in or user logging in
    if (request.session.user[0].admin == true) {
        console.log("admin entered");
        response.render("admin-dashboard", {
            title: "Admin Dashboard",
            data: request.session.user,
            logout: true,
            admin: true
        });
    } else {
        console.log("user entered");
        response.render("dashboard", {
            title: "User Dashboard",
            data: request.session.user,
            logout: true,
            user: true
        });
    }
});

router.get("/list", ensureSignIn, (request, response) => {
    if (request.session.user[0].admin == true) {
        db.getPackage().then((data)=>{
            response.render("list", {
                title: "Meal Listing",
                logout: true,
                admin: true,
                data: (data.length!=0)?data:undefined
            });
        }).catch((err)=>{
            res.render("list",{
                title: "Meal Listing",
                message:err,
                logout: true,
                admin: true
            });
        })
        
    }
    else{
        response.redirect("/");
    }
})

router.get("/add", ensureSignIn, (request, response) => {
    if (request.session.user[0].admin == true) {
        response.render("add", {
            title: "Meal Listing",
            logout: true,
            admin: true
        })
    }
    else{
        response.redirect("/");
    }
})

//upload.single("packagePhoto"),

router.post("/add",(request, response) => {
        db.addPackage(request.body).then(() => {
            response.redirect("/list");
        }).catch(err => {
            console.log(`Error ${err}`);
            response.render("add", {
                title: "Meal Listing",
                logout: true,
                admin: true,
                message: err
            })
        })
});

//Delete Route
router.get("/delete",(req,res)=>{
    if(req.query.name){
      db.deletePackageByName(req.query.name).then(()=>{
        res.redirect("/list");
      }).catch(()=>{
        console.log("couldn't delete package");
        res.redirect("/list");
      })
    }
    else{
      console.log("No Query");
      res.redirect("/list");
    }
  });

router.get("/logout", (request, response) => {
    request.session.reset();
    response.redirect("/list");
});


module.exports = router;