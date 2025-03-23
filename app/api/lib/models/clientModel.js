const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({

    logo: {
        type: String,
        required: true,
    }

});


const Client = mongoose.models.Client || mongoose.model("Client", clientSchema);
module.exports = Client;   
