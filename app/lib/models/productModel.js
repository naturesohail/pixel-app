import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: false, 
    },
    image: {
        type: String,
        required: false,
    },
    categories:{
        type: String
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: String,
        required: false,
    },
    productStatus: {
        type: String,
        required: false,
    }
     
},

{timestamps: false}

);



const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;