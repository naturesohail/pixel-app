import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
    {
        pageName: {
            type: String,
            required: false,
            unique: false,
        },
        metaTitle: {
            type: String,
            required: false
        },
        metaDescription: {
            type: String,
            required: false
        },
        metaKeywords: {
            type: String
        },
        altTag:{
            type:String
        },
        contents: {
            type: String, 
        },
        banner: {
            type: String,
            required: false,
        },
        bannerHeading: {
            type: String,
            required: false,
        },

    },
    { timestamps: false }
);


export default mongoose.models.Page || mongoose.model('Page', PageSchema);
