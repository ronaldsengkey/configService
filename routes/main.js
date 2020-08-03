"use strict";
const boom = require('boom');
let apiList = require("../services/apiList"),
    sa = require("../services/serviceAnalytic"),
    response = require("./response");

async function route(fastify, options) {
    try {
        await sa.mainServiceAnalytic();
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

        // const schemaServiceAnalytic = {
        //     body: {
        //         type: 'object',
        //         additionalProperties: false,
        //         required: ['serviceName', 'responseCode', 'status', 'cpuProfiling'],
        //         properties: {
        //             serviceName: {
        //                 type: 'string'
        //             },
        //             responseCode: {
        //                 type: 'string'
        //             },
        //             status: {
        //                 type: 'string'
        //             },
        //             cpuProfiling: {
        //                 type: 'string'
        //             }
        //         }
        //     }
        // }

        //Route List
        await fastify.get('/config/getApiService/:param', apiList.apiList);
        await fastify.get('/config/test2', apiList.test2);
        await fastify.get('/config/test3', apiList.test3);

        // await fastify.post('/wallet/pin/validation', apiList.pinValidation);
        // await fastify.post('/wallet/saldo', apiList.getSaldo);

        await fastify.post('/config/createApiService', {
            schema
        }, apiList.createApi);

        // await fastify.post('/config/createServiceAnalytic', {
        //     schemaServiceAnalytic
        // }, sa.createServiceAnalytic);
        await fastify.post('/config/deleteServiceAnalytic', {}, sa.deleteServiceAnalytic);
    } catch (err) {
        boom.boomify(err);
        console.log('err =>',err)
        return response.serverError(err, "Internal server error", reply);
    }
}
module.exports = route;