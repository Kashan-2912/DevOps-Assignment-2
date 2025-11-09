import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user; //bcz in protectRoute we had user
        
        // farz ki pehle ka koi x product cart mn pra tha uar me dubara se usko add to cart krta hu to is bari sirf +1 hoga cart mn quantity...
        const existingItem = user.cartItems.find(item => item.id === productId);
        if(existingItem){
            existingItem.quantity += 1
        } else {
            // otherwise add product to cart
            user.cartItems.push(productId)
        }

        await user.save()
        res.json(user.cartItems)
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({message: "Server error", error: error.message})
    }
}

export const removeAllFromCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        if(!productId){
            user.cartItems = []
            // console.log("All products removed from cart")
        } else{	
            user.cartItems = user.cartItems.filter((item) => item.id !== productId)
            // console.log("Removing product from cart")
        }

        await user.save();
        res.json(user.cartItems)
    } catch (error) {
        conole.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({message: "Server error", error: error.message})
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const {id:productId} = req.params;
        const {quantity} = req.body
        const user = req.user
        const existingItem = user.cartItems.find((item) => item.id === productId)

        if(existingItem){

            //lets say i was decreasing quantity, after 1 it went to 0 in quantity, so we have to just remove product from cart ...
            if(quantity === 0){
                user.cartItems = user.cartItems.filter((item) => item.id !== productId)
                await user.save();
                return res.json(user.cartItems)
            }

            existingItem.quantity = quantity
            await user.save()
            res.json(user.cartItems)
        } else {
            res.status(404).json({message: "Product not found in cart"})
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({message: "Server error", error: error.message})
    }
}

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({_id: {$in: req.user.cartItems}})

        //add quantity for each product
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(), quantity: item.quantity}
        })

        res.json(cartItems)
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({message: "Server error", error: error.message})
    }
}