'use strict';
var mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const apiSchema = new Schema({
    serviceName: {
        type: String,
        required: true
    },
    domain: {
        // Example (sandbox.api.ultipay.id)
        type: String,
        required: true
    },
    port: {
        type: String,
        required: false
    },
    server: {
        // Example (Aws, Telkom)
        type: String,
        required: true
    },
    category: {
        // Example (service, database)
        type: String,
        required: true
    },    
    status: {
        // Example (1 = enable, 0 = disabled) default value is 1
        // type: Number,
        type: String,
        required: true
        // Example (on/off) default value is on
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
    }
});
const newApiSchema = mongoose.model('serviceParent', apiSchema);
module.exports = newApiSchema;