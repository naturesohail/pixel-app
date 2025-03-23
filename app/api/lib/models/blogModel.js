const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    thumbnail: {
        type: String,
        required: false, 
    },
    title: {
        type: String,
        required: false, 
    },
    content: {
        type: String,
        required: false,
    },
    category:{
        type:String,
        required:false
    }

},

{

    timestamps:true
}

);


const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

module.exports = Blog;   
