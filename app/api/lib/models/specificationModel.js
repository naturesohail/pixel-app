import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema({
    specificationName: {
        type: String,
        required: true, 
    },
    logo: {
        type: String,
        required: true,
    }
});

const Specification = mongoose.models.Specification || mongoose.model("Specification", specificationSchema);

export default Specification;
