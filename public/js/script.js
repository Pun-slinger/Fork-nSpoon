function responsive() {
    var x = document.getElementById("topnavbar");
    if (x.className === "topnavbar") {
        x.className += " responsive";
    } else {
        x.className = "topnavbar";
    }
}

function SignUpValidation() {
    var fname, lname, email, password, fnameerror, lnameerror, emailerror, passworderror;
    fname = document.getElementById("fnameup").value;
    lname = document.getElementById("lnameup").value;
    email = document.getElementById("emailup").value;
    password = document.getElementById("passwordup").value;

    if (fname == "") {
        fnameerror = "This field is required";
    } else {
        fnameerror = "";
    }

    if (lname == "") {
        lnameerror = "This field is required";
    } else {
        lnameerror = "";
    }

    if (email == "") {
        emailerror = "This field is required";
    } else {
        emailerror = "";
    }

    if (password == "") {
        passworderror = "This field is required";
    } else if (password == password.match(/\W/g)) {
        passworderror = "Numbers and letters only";
    } else if (password.length < 6 || password.length > 12) {
        passworderror = "Password length between 6 to 12 characters only";
    } else {
        passworderror = "";
    }

    document.getElementById("fnameerrorup").innerHTML = fnameerror;
    document.getElementById("lnameerrorup").innerHTML = lnameerror;
    document.getElementById("emailerrorup").innerHTML = emailerror;
    document.getElementById("passworderrorup").innerHTML = passworderror;

}

function SignInValidation() {
    var email, password, emailerror, passworderror;

    email = document.getElementById("useremailin").value;
    password = document.getElementById("passwordin").value;

    if (email == "") {
        emailerror = "This field is required";
    } else {
        emailerror = "";
    }

    if (password == "") {
        passworderror = "This field is required";
    } else {
        passworderror = "";
    }

    document.getElementById("emailerrorin").innerHTML = emailerror;
    document.getElementById("passworderrorin").innerHTML = passworderror;
}

function SignInLogOut(){
    SignInValidation();
}