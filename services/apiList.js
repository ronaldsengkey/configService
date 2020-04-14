"use strict";
const boom = require("boom");
let response = require("../routes/response"),
    mongoose = require("mongoose").set("debug", true),
    mongoConf = require("../config/mongo"),
    apiSchema = require("./apiListSchema"),
    fs = require("fs"),
    pubKey = fs.readFileSync("./publicKey.key", "utf8"),
    Cryptr = require("cryptr"),
    cryptr = new Cryptr(pubKey),
    data = "";

async function apiList(request, reply) {
    try {
        // Filter access request
        let param = request.params.param;
        await mongoose.connect(mongoConf.mongoDb.url, {
            useNewUrlParser: true,
        });
        let query = await apiSchema.find({
            fieldTypeOrigin: param,
        });
        if (query.length > 0) {
            // Return response
            await mongoose.connection.close();
            return response.ok(query, "Getting acces success", reply);
        } else {
            return response.notfound(
                "",
                "sory data not found, please check your parameter",
                reply
            );
        }
    } catch (err) {
        boom.boomify(err);
        return response.serverError(err, "Internal server error", reply);
    }
}

async function createApi(request, reply) {
    try {
        // Get body pot
        let param = request.body,
            fieldName = cryptr.encrypt(param.fieldName),
            fieldValue = cryptr.encrypt(param.fieldValue),
            fieldType = cryptr.encrypt(param.fieldType);

        // Run mongoose connection 
        await mongoose.connect(mongoConf.mongoDb.url, {
            useNewUrlParser: true
        });

        // Declare data object to save 
        let newApi = new apiSchema({
            fieldName: fieldName,
            fieldValue: fieldValue,
            fieldType: fieldType,
            fieldNameOrigin: param.fieldName,
            fieldValueOrigin: param.fieldValue,
            fieldTypeOrigin: param.fieldType,
            status: 1,
        });

        let na = await newApi.save();
        await mongoose.connection.close();
        if (na) {
            return response.ok(na, "New config created", reply);
        } else {
            return response.serverError(err, "Internal server error", reply);
        }
    } catch (err) {
        boom.boomify(err);
        return response.serverError(err, "Internal server error", reply);
    }
}

module.exports = {
    apiList,
    createApi,
};