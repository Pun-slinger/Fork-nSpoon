const database = {

    packagedb: [
        {
            name: "British Package",
            desc: "A meal package featuring some of the best British dishes.",
            price: 159,
            image: "british-package.jpg",
            dish: [
                {
                    name: "British Breakfast",
                    price: 15,
                    image: "simple breakfast.jpg",
                    top: false
                }
            ]
        },
        {
            name: "Japanese Package",
            desc: "A healthy meal package that allow you to experience the Japanese crusine.",
            price: 169,
            image: "japan-package.jpg",
            dish: [
                {
                    name: "Shrimp Ramen",
                    price: 23,
                    image: "ramen-egg-seafood.jpg",
                    top: true
                },
                {
                    name: "Sushi Experience",
                    price: 32,
                    image: "japan-package.jpg",
                    top: false
                }
            ]
        },
        {
            name: "Salad Package",
            desc: "A veggies-lover's package with a natural and nutrient-rich approach.",
            price: 149,
            image: "salad-package.jpg",
            dish: [
                {
                    name: "Shrimp Salad",
                    price: 30,
                    image: "shrimp-salad.jpg",
                    top: true
                },
                {
                    name: "Chicken Corn Salad",
                    price: 25,
                    image: "chicken-corn-salad.jpg",
                    top: false
                },
                {
                    name: "Walnut Salad",
                    price: 15,
                    image: "salad-package.jpg",
                    top: false
                }
            ]
        },
        {
            name: "Soup Package",
            desc: "A warm, liquidy, and nutrious package perfect for recovering from a sickness.",
            price: 159,
            image: "soup-package.jpg",
            dish: [
                {
                    name: "Clam and Veggies Soup",
                    price: 33,
                    image: "clam-veggy-soup.jpg",
                    top: false
                },
                {
                    name: "Seafood Deluxe Soup",
                    price: 45,
                    image: "seafood soup.jpg",
                    top: true
                }
            ]
        },
        {
            name: "The Dessert Package",
            desc: "A package full of desserts, putting the finishing touch on your every meal.",
            price: 95,
            image: "chocopancake-raspberry.jpg",
            dish: [
                {
                    name: "Rainbow Cake",
                    price: 36,
                    image: "rainbow cake.jpg",
                    top: true
                }
            ]
        }
    ],

    getAllPackage() {
        return this.packagedb;
    },

    getAllTopMeals() {
        let topmeals = [];
        this.packagedb.forEach((element) => {
            element.dish.forEach((dishelement) => {
                if (dishelement.top == true) {
                    topmeals.push(dishelement);
                }
            })
        }
        )
        return topmeals;
    }
}

module.exports = database;