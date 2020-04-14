"use strict";
async function ok(values, message, reply) {
    return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({
            code: 200,
            message: message,
            values: values,
        });
}

async function notfound(values, message, reply) {
    return reply
        .code(404)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({
            code: 404,
            message: message,
            values: values,
        });
}

async function badRequest(values, message, reply) {
    return reply
        .code(400)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({
            code: 400,
            message: message,
            values: values,
        });
}

async function serverError(values, message, reply) {
    return reply
        .code(500)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({
            code: 500,
            message: message,
            values: values,
        });
}

module.exports = {
    ok,
    badRequest,
    serverError,
    notfound
};