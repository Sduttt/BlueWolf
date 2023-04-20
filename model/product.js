const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [120, 'Product name cannot exceed 120 characters']
    },

    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [5, 'Product price cannot exceed 5 characters'],
    },
    
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },

    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],

    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'ShortSleevs', 'LongSleevs', 'Hoodies', 'SweatShirts'
            ],
        },
        message: 'Please select correct category for product'
    },

    brand: {
        type: String,
        required: [true, 'Please select brand for this product'],
    },

    rating: {
        type: Number,
        default: 0
    },

    numOfReviews: {
        type: Number,
        default: 0
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);