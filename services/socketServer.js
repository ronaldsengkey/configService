const socketio = require('socket.io');
const serviceModel = require('../services/serviceAnalytic');
const socketService = require('./socketService');
let io;

function listen(app){
    io = socketio.listen(app, {
        path: '/configService'
    });

    io.on('connection', function(socket){
        console.log('Client connected::', socket.id);

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
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected::', socket.id)
        });
    });

    return io;
}

module.exports = {
    listen, io
}
