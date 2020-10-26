'use strict';
var mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const apiSchema = new Schema({
    serviceName: {
        type: String,
        required: true
    },
    server: {
        // Example (Aws, Telkom)
        type: String,
        required: true
    },
    category: {
        // Example (transaction, friend)
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
    }
});
const newApiSchema = mongoose.model('serviceChild', apiSchema);
module.exports = newApiSchema;