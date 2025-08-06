import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    sizes: [{
        type: String,
        required: true
    }],
    quantity: {
        type: Number,
        required: true
    },
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const questionModel = mongoose.models.question || mongoose.model('question', questionSchema);

export default questionModel;