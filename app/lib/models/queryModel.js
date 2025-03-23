import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    name: {
        type: String,
        required: false, 
    },
    email: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
     message: {
        type: String,
        required: false,
    }
});

const Query = mongoose.models.Query || mongoose.model("Query", querySchema);

export default Query;
