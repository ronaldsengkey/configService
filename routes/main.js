"use strict";
const boom = require('boom');
let apiList = require("../services/apiList"),
    response = require("./response");

async function route(fastify, options) {
    try {

        // Schema validator
        const schema = {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['fieldName', 'fieldValue', 'fieldType'],
                properties: {
                    fieldName: {
                        type: 'string'
                    },
                    fieldValue: {
                        type: 'string'
                    },
                    fieldType: {
                        type: 'string'
                    }
                }
            }
        }

        //Route List
        await fastify.get('/config/getApiService/:param', apiList.apiList);
        await fastify.get('/config/test2', apiList.test2);
        await fastify.get('/config/test3', apiList.test3);

        await fastify.post('/config/createApiService', {
            schema
        }, apiList.createApi);
    } catch (err) {
        boom.boomify(err);
        return response.serverError(err, "Internal server error", reply);
    }
}
module.exports = route;