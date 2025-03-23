const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema({
    amenityName: {
        type: String,
        required: true, 
    },
    logo: {
        type: String,
        required: true,
    }

});


const Amenity = mongoose.models.Amenity || mongoose.model("Amenity", amenitySchema);

module.exports = Amenity;   
