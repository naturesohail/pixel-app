const mongoose = require("mongoose");

const categoryModel = new mongoose.Schema({
    category:{
        type:String,
        required: false
    },
    image: {
        type: String,
        required: true,
    }

});


const Category = mongoose.models.Category || mongoose.model("Category", categoryModel);
module.exports = Category;   
