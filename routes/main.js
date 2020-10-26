"use strict";
const boom = require('boom');
let apiList = require("../services/apiList"),
    sa = require("../services/serviceAnalytic"),
    response = require("./response");

async function route(fastify, options) {
    try {
        await sa.mainServiceAnalytic();
        const schema = {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['fieldName', 'fieldValue', 'fieldType'],
                properties: {
                    fieldName: { type: 'string' },
                    fieldValue: { type: 'string' },
                    fieldType: { type: 'string' }
                }
            }
        }

        const parentServiceSchema = {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['serviceName', 'domain', 'port', 'server'],
                properties: {
                    serviceName: {type: 'string'},
                    domain: {type: 'string'},
                    port: {type: 'string'},
                    server: {type: 'string'}
                }
            }
        }

        const childServiceSchema = {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['serviceName', 'category', 'path', 'server'],
                properties: {
                    serviceName: {type: 'string'},
                    category: {type: 'string'},
                    path: {type: 'string'},
                    string: {type: 'string'}
                }
            }
        }        
        //Route List
        await fastify.get('/config/getApiService/:param', apiList.apiList);
        await fastify.get('/config/test2', apiList.test2);
        await fastify.get('/config/test3', apiList.test3);

        // await fastify.post('/wallet/pin/validation', apiList.pinValidation);
        // await fastify.post('/wallet/saldo', apiList.getSaldo);

        await fastify.post('/config/createApiService', {
            schema
        }, apiList.createApi);
        await fastify.post('/config/createParentService', {
            parentServiceSchema
        }, apiList.createParentService);
        await fastify.post('/config/updateParentService', {
            parentServiceSchema
        }, apiList.updateParentService);
        await fastify.post('/config/createChildService', { 
            childServiceSchema
        }, apiList.createChildService);

        await fastify.post('/config/deleteServiceAnalytic', {}, sa.deleteServiceAnalytic);
    } catch (err) {
        boom.boomify(err);
        console.log('err =>',err)
        return response.serverError(err, "Internal server error", reply);
    }
}
module.exports = route;