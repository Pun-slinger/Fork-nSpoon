//start off with the cart empty. 
var userCart = [];

//adds a item from systems to the cart
module.exports.addItem = (inItem)=>{
    console.log("addItem")
    console.log("Adding cart" + inItem.name);
    return new Promise((resolve,reject)=>{
        userCart.push(inItem);
        resolve(userCart.length);
    });
}

//removes an item from the cart
module.exports.removeItem = (inItem)=>{
    console.log("removeItem")
    return new Promise((resolve,reject)=>{
        for(var i = 0; i< userCart.length; i++){
            if(userCart[i].name == inItem){
                userCart.splice(i,1);
                i = userCart.length;
            }
        }
        resolve();
    });
}

//returns the cart array and all items
module.exports.getCart = ()=>{
    console.log("getCart")
    console.log(userCart)
    return new Promise((resolve, reject)=>{
            resolve(userCart);
    });
}

//calculates the price of all items in the cart
module.exports.total = ()=>{
    console.log("total")
    return new Promise((resolve, reject)=>{
        var price=0;//if check if car is empty
        if(userCart){
            userCart.forEach(x => {
                price += x.price;
            });
        }
        resolve(price);
    });
}

module.exports.clearCart = ()=>{
    userCart = [];
}