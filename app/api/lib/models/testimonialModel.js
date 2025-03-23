const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false, 
    },
    designation: {
        type: String,
        required: false, 
    },
    text:{
        type:String,
        required: false
    },
    profilePicture:{
        type:String,
        required:false
    },
    backgroundImage:{
        type:String,
        required:false
    },

    video: {
        type: String,
        required: false,
    }

});


const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;   
