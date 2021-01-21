'use strict';
var mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const apiSchema = new Schema({
    serviceName: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    // responseCode: {
    //     type: String,
    //     required: true
    // },
    status: {
        type: String,
        required: true
    },    
    cpuProfiling: {
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
const newApiSchema = mongoose.model('serviceAnalytics', apiSchema);
module.exports = newApiSchema;