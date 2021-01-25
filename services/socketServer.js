'use strict'
const socketio = require('socket.io');
const serviceModel = require('../services/serviceAnalytic');
const socketService = require('./socketService');
const mongoose = require("mongoose").set("debug", true);
const mongoConf = require("../config/mongo");
const serviceParent = require("./serviceParentSchema");
const serviceAnalytic = require("./serviceAnalyticsSchema")
let io;

function listen(app){
    io = socketio(app, {
        path: '/configService',
    });
    let service = [];

    io.on('connection', function(socket){
        // console.log('Client connected::', socket.id, socket.handshake );
        // socket.emit('tes', socket.id);
        socket.on('getService', async () => {
            console.log('getservice::');
            socket.emit('getService', await serviceModel.getApiService());
        });

        socket.on('getTicketing', async()=>{
            try {
                console.log('getTicketing::');
                let result = await socketService.getTicketing();
                if (result) {
                    socket.emit('getTicketing', result);   
                }
            } catch (error) {
                console.log('error::', error);
            }
        });

        socket.on('getTransaction', async()=>{
            try {
                console.log('getTransaction::');
                let result = await socketService.getTransaction();
                if (result) {
                    socket.emit('getTransaction', result);   
                }
            } catch (error) {
                console.log('error::', error);
            }
        })

        socket.on('dashboardConnect', async(data)=>{
            createService(data);
            service[socket.id] = data;
            socket.emit('dashboardConnect', 'success');
            console.log("dashboardConnect::", socket.id, service);
        })

        socket.on('disconnect', () => {
            try {
                service[socket.id].status = 'off';
                createService(service[socket.id]);
                delete service[socket.id];
                console.log("service::", service);
            } catch (error) {
                // console.log("error::", error);
            }
            // console.log('Client disconnected::', socket.id, service)
        });
    });

    return io;
}

module.exports = {
    listen, io
}

async function createService(data) {
    console.log('createService::', data);
    try {
        // Run mongoose connection
        await mongoose.connect(mongoConf.mongoDb.url, {
            useNewUrlParser: true,
        });
        // mongoose.set('debug', false);
        let update = await serviceParent.findOneAndUpdate({
            serviceName: data.serviceName,
            domain: data.domain,
            hostName: data.hostName,
            port: data.port,
            server: data.server,
            category: data.category,
        },{
            status: data.status
        },{
            upsert: true, 
            setDefaultsOnInsert: true,
            new: true
        });
        let newServiceAnalytic = new serviceAnalytic({
            serviceName: data.serviceName,
            // responseCode: data.responseCode,
            domain: data.domain,
            status: data.status,
            cpuProfiling: data.cpuProfiling,
        });
      
        await newServiceAnalytic.save();
        await mongoose.connection.close();
        io.emit('updateService', JSON.stringify({
            id: update._id,
            serviceName: update.serviceName,
            status: data.status,
            category: data.category,
            cpuProfiling: data.cpuProfiling,
        })); 
        return true;
    } catch (err) {
        console.log("error::", err);
        return false;
    }
}