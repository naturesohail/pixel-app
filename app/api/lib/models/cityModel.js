const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({

    city: {
        type: String,
        required: true,
    }

});


const City = mongoose.models.City || mongoose.model("City", citySchema);
module.exports = City;   
