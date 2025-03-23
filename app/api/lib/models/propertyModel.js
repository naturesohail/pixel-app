import mongoose from "mongoose";
const FaqSchema = new mongoose.Schema({
    question: { type: String, required: false },
    answer: { type: String, required: false }
  });
  
const propertySchema = new mongoose.Schema({
    propertyName: {
        type: String,
        required: false, 

    },
    bhkDetails: [{
          type: { type: String, required: false }, 
          price: { type: String, required: false }, 
          sqft: { type: String, required: false }, 
          availability: { type: String, required: false }, 
          priceUnit: { type: String, required: false }, 
          unit: { type: String, required: false }, 
    }],
    image: {
        type: String,
        required: false,
    },
    otherImages: {
        type: [String],
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    propertyPrice: {
        type: String,
        required: false,
    },
    propertyStatus: {
        type: String,
        required: false,
    },
    area: [{ type: mongoose.Schema.Types.Mixed, ref: "City" }], 
     status: {
        type: String,
        required: false,
    },
    reraNo: {
        type: String,
        required: false,
    },
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Amenity" }], 
    specifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Specification" }], 
    apartmentBrochure: {
        type: String,
        required: false,
    },
    faqs: [FaqSchema],
    mapUrl: {
        type: String,
        required: false,
    },
    aboutProperty: {
        type: String,
        required: false,
    },
    metaTitle: {
        type: String,
        required: false,
    },
    metaKeywords: {
        type: String,
        required: false,    
    },
    metaDescription: {
        type: String,
        required: false,
    },  
    urlSlug: {  
        type: String,
        required: false,
    },
    canonicalUrl: {
        type: String,
        required: false,
    },
    altTag: {
        type: String,
        required: false,
    },
     schemaMarkup: {
        type: String,
        required: false,
    },  
},

{timestamps: false}

);



const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);

export default Property;