const mongoose = require("mongoose");

const featuredSchema = new mongoose.Schema({

    logo: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    }

});


const Featured = mongoose.models.Featured || mongoose.model("Featured", featuredSchema);
module.exports = Featured;   
