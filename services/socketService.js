const reqService = require('./requestService');
const mongoose = require("mongoose").set("debug", true);
const socketServer = require('./socketServer');
const pg = require('pg');

exports.getTicketingIT = async function (){
    try {
        var options = {
            'method': 'GET',
            'url': process.env.BACKEND_SERVER + '/backend/socket/ticketingIT',
            'headers': {
                'code': process.env.SERVICE_CODE
            }
        };
        let result = await reqService.sendRequest(options);
        result = JSON.parse(result);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            console.log("result.data::", result.data);
            return result.data  
        } else {
            return false
        }  
    } catch (error) {
        console.log('error::', error);
        return false;
    }
}

exports.getTicketing = async function (){
    try {
        var options = {
            'method': 'GET',
            'url': process.env.BACKEND_SERVER + '/backend/socket/ticketing',
            'headers': {
                'code': process.env.SERVICE_CODE
            }
        };
        let result = await reqService.sendRequest(options);
        result = JSON.parse(result);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            console.log("result.data::", result.data);
            return result.data  
        } else {
            return false
        }  
    } catch (error) {
        console.log('error::', error);
        return false;
    }
}

exports.getTransaction = async function (){
    try {
        var options = {
            'method': 'GET',
            'url': process.env.TRANSACTION_SERVER + '/transaction/socket/getSummaryTransaction',
            'headers': {
                'code': process.env.SERVICE_CODE
            }
        };
        let result = await reqService.sendRequest(options);
        result = JSON.parse(result);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            console.log("result.data::", result.data);
            return result.data  
        } else {
            return false
        }  
    } catch (error) {
        console.log('error::', error);
        return false;
    }
}

exports.getCustomerTransaction = async function(){
    try {
        var options = {
            'method': 'GET',
            'url': process.env.TRANSACTION_SERVER + '/transaction/socket/getCustomerTransaction',
            'headers': {
                'code': process.env.SERVICE_CODE
            }
        };
        let result = await reqService.sendRequest(options);
        result = JSON.parse(result);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            console.log("result.data::", result.data);
            return result.data  
        } else {
            return false
        }
    } catch (error) {
        console.log('error::', error);
        return false;
    }
}

module.exports.checkDatabase = async function (data) {
    switch (data.type) {
        case "postgre":
            let url_pg = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${data.domain}:${data.port}/${data.serviceName}`;
            console.log('URL PG => ', url_pg)
            pgCon = new pg.Client(url_pg);
            await pgCon.connect().then(function (e) {
                console.log('PG Connected')
                data.status = "on";
            }).catch(function (err) {
                console.log('postgre ==> ', err)
                data.status = 'off'
            })
            break;
        case "mongo":
            url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${data.domain}:${data.port}/${data.serviceName}?authSource=admin`;
            console.log('mongo ==> ', url_mongo)
            await mongoose
                .connect(url_mongo, {
                    useNewUrlParser: true,
                })
                .then(function (e) {
                    console.log("MONGO CONNECTED");
                    data.status = 'on';
                }).catch(err => {
                    console.log('Error connect mongo ==> ', err)
                    data.status = "off";
                });
            break;
    }
    console.log("checkDatabase::", data);
    socketServer.createService(data);
}