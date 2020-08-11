const express = require('express');
const router = express.Router();
const db = require("../public/js/db.js");
const cart = require("../public/js/cart.js");
const database = require("../models/database")
const clientSessions = require("client-sessions");
const { request, response } = require('express');

// Setup client-sessions
router.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "forknknife_web322", // this should be a long un-guessable string.
    duration: 4 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 2000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

router.get("/", (request, response) => {
    if (request.session.user) {
        db.getPackagesByDisplay(true).then((data) => {
            response.render("index", {
                title: "Fork n' Spoon",
                data: (data.length != 0) ? data : undefined,
                user: request.session.user,
                logout: true,
            })
        })
    } else {
        db.getPackagesByDisplay(true).then((data) => {
            response.render("index", {
                title: "Fork n' Spoon",
                data: (data.length != 0) ? data : undefined,
                login: true
            })
        })
    }
});

router.get("/package", (request, response) => {
    if (request.session.user) {
        db.getPackage().then((data) => {
            response.render("package", {
                title: "All Package Listing",
                data: (data.length != 0) ? data : undefined,
                user: request.session.user,
                logout: true
            });
        })
    } else {
        db.getPackage().then((data) => {
            response.render("package", {
                title: "All Package Listing",
                data: (data.length != 0) ? data : undefined,
                login: true
            });
        })
    }
});

router.get("/package/description", ensureSignIn, (request, response) => {
    if (request.query.name) {
        console.log(request.query.name);
        db.getPackagesByName(request.query.name).then((packages) => {
            console.log(packages);
            response.render("packagedesc", {
                title: packages[0].name,
                logout: true,
                user: request.session.user,
                data: packages[0]
            }); //using [0] because students is an array
        }).catch((err) => {
            console.log(err);
            response.redirect("/package");
        });
    }
    else {
        console.log("No Query");
        response.redirect("/package");
    }
});

//AJAX route to add a product. Replies back with number of items in cart
router.post("/addProduct", (request, response) => {
    console.log("Adding prod with name: " + request.body.name);
    db.getItem(request.body.name)
        .then((item) => {
            cart.addItem(item)
                .then((numItems) => {
                    response.json({ data: numItems });
                }).catch(() => {
                    response.json({ message: "error adding" });
                })
        }).catch(() => {
            response.json({ message: "No Items found" })
        })
});

//Route to see cart and items
router.get("/cart", ensureSignIn, (request, response) => {
    console.log("/cart")
    var cartData = {
        cart: [],
        total: 0
    };
    cart.getCart().then((items) => {
        cartData.cart = items;
        cart.total().then((total) => {
            cartData.total = total;
            console.log(cartData)
            response.render("cart", {
                data: cartData,
                title: "Cart",
                user: request.session.user,
                logout: true
            });
        }).catch((err) => {
            response.send("There was an error getting total: " + err);
        });
    })
        .catch((err) => {
            res.send("There was an error: " + err);
        });
});

//AJAX route to remove item by name. Replies back with total and list of items. 
router.post("/removeItem", (request, response) => { //return the cart to re-render the page
    console.log("/reomveItem")
    var cartData = {
        cart: [],
        total: 0
    };
    cart.removeItem(request.body.name).then(cart.total)
        .then((inTotal) => {
            cartData.total = inTotal;
            cart.getCart().then((items) => {
                cartData.cart = items;
                response.json({ data: cartData });
            }).catch((err) => { response.json({ error: err }); });
        }).catch((err) => {
            response.json({ error: err });
        })
});

router.post("/cart", (request, response) => {
    var cartData = {
        cart: [],
        total: 0
    };
    cart.getCart().then((items) => {
        cartData.cart = items;
        cart.total().then((total) => {
            cartData.total = total;
            console.log(cartData)
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
            const msg = {
                to: `${request.session.user[0].email}`,
                from: 'qpham4@myseneca.ca',
                subject: "Fork'n Spoon Order Email",
                html: `Hello ${request.session.user[0].firstName} from Fork'n Spoon. This is your order.<br>
                    Total of your order: $${cartData.total}<br>`
            };
            sgMail.send(msg)
                .then(() => {
                    cart.clearCart();
                    response.redirect("/");
                })
                .catch(err => {
                    console.log(`Error ${err}`);
                })
        }).catch((err) => {
            response.send("There was an error getting total: " + err);
        });
    }).catch((err) => {
        res.send("There was an error: " + err);
    });
});

router.get("/welcome", (request, response) => {
    response.render("welcome", {
        title: "Welcome",
        user: request.session.user,
        logout: true
    })
});

function ensureSignIn(request, response, next) {
    if (!request.session.user) {
        response.render("signin", {
            title: "Sign In",
            login: true,
            message: "You need to sign in in order to access that page."
        })
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

            const { fnameup, lnameup, emailup, passwordup, urlup } = request.body;

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
            user: request.session.user,
            logout: true,
            admin: true
        });
    } else {
        console.log("user entered");
        response.render("dashboard", {
            title: "User Dashboard",
            data: request.session.user,
            user: request.session.user,
            logout: true,
        });
    }
});

router.get("/list", ensureSignIn, (request, response) => {
    if (request.session.user[0].admin == true) {
        db.getPackage().then((data) => {
            response.render("list", {
                title: "Meal Listing",
                logout: true,
                admin: true,
                user: request.session.user,
                data: (data.length != 0) ? data : undefined

            });
        }).catch((err) => {
            response.render("list", {
                title: "Meal Listing",
                message: err,
                logout: true,
                admin: true,
                user: request.session.user,
            });
        })

    }
    else {
        response.redirect("/");
    }
})

router.get("/add", ensureSignIn, (request, response) => {
    if (request.session.user[0].admin == true) {
        response.render("add", {
            title: "Meal Listing",
            logout: true,
            admin: true,
            user: request.session.user,
        })
    }
    else {
        response.redirect("/");
    }
})

router.post("/add", (request, response) => {
    db.addPackage(request.body).then(() => {
        response.redirect("/list");
    }).catch(err => {
        console.log(`Error ${err}`);
        response.render("add", {
            title: "Meal Listing",
            logout: true,
            admin: true,
            message: err,
            user: request.session.user
        })
    })
});

router.get("/edit", ensureSignIn, (request, response) => {
    if (request.query.name) {
        db.getPackagesByName(request.query.name).then((packages) => {
            response.render("edit", {
                title: "Meal Editing",
                logout: true,
                admin: true,
                user: request.session.user,
                data: packages[0]
            }); //using [0] because students is an array
        }).catch((err) => {
            console.log(err);
            response.render("list", {
                title: "Meal Listing",
                message: err,
                logout: true,
                admin: true,
                user: request.session.user,
            });
        });
    }
    else {
        console.log("No Query");
        res.redirect("/list");
    }
});

router.post("/edit", (request, response) => {
    db.editPackage(request.body).then(() => {
        response.redirect("/list");
    }).catch((err) => {
        console.log(`Error ${err}`);
        response.render("list", {
            title: "Meal Editing",
            logout: true,
            admin: true,
            message: err,
            user: request.session.user
        })
    })
});

//Delete Route
router.get("/delete", (request, response) => {
    if (request.query.name) {
        db.deletePackageByName(request.query.name).then(() => {
            response.redirect("/list");
        }).catch(() => {
            console.log("couldn't delete package");
            response.redirect("/list");
        })
    }
    else {
        console.log("No Query");
        response.render("list", {
            title: "Meal Listing",
            message: err,
            logout: true,
            admin: true,
            user: request.session.user,
        });
    }
});

router.get("/logout", (request, response) => {
    request.session.reset();
    response.redirect("/signin");
});


module.exports = router;