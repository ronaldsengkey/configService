'use strict';
var mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const apiSchema = new Schema({
    fieldName: {
        type: String,
        required: true
    },
    fieldValue: {
        type: String,
        required: true
    },
    fieldType: {
        type: String,
        required: true
    },
    fieldNameOrigin: {
        type: String,
        required: true
    },
    fieldValueOrigin: {
        type: String,
        required: true
    },
    fieldTypeOrigin: {
        // Example (apiService, urlServer, keyConfig , database)
        type: Number,
        required: true
    },
    status: {
        // Example (1 = enable, 0 = disabled) default value is 1
        type: Number,
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
const newApiSchema = mongoose.model('configService', apiSchema);
module.exports = newApiSchema;