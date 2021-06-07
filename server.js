"use strict";
const path = require("path");
const gateway = require("express-gateway");
const fastify = require("fastify")({
  logger: true
});
const axios = require("axios");
const helmet = require("helmet");
require("dotenv").config();
const boom = require('boom');
// gateway().load(path.join(__dirname, "config")).run();

fastify.register(require('./routes/main'));

const io = require('./services/socketServer').listen(fastify.server);
const socketService = require('./services/socketService');

fastify.get('/config/update/:type', async function(req, res){
  console.log('/update::');
  let result = false;
  const code = req.headers.code;
  const param = req.headers.param;
  const type = req.params.type;
  try {
    if (code == process.env.SERVICE_CODE) {
      console.log('type::', type);
      switch (type) {
        case 'service':
          io.emit('updateService', param); 
          result = 'success';  
          break;
        
        case 'ticket':
          let data = await socketService.getTicketing();
          if (data) {
              io.emit('getTicketing', data);   
          }
          let data2 = await socketService.getTicketingIT();
          if (data2) {
              io.emit('getTicketingIT', data2);
          }
          result = 'success';
          break;

        case 'transaction':
          let datat = await socketService.getTransaction();
          if (datat) {
              io.emit('getTransaction', datat);   
          }
          let datat2 = await socketService.getCustomerTransaction();
          if (datat2) {
              io.emit('getCustomerTransaction', datat2); 
          }
          result = 'success';
          break;

        default:
          break;
      } 
    }
  } catch (error) {
    console.log('error::', error);
    result = error; 
  }
  res.send('update::' + result);
})

const start = async () => {
  try {
    fastify.use(helmet());
    const databases = require('./databaseList.json');
    const CronJob = require('cron').CronJob;
    let job1 = new CronJob('0 */10 * * * *', async function() {
      console.log('cronjob-1::' + new Date());
      for(let database of databases){
        // console.log("database::", database);
        await socketService.checkDatabase(database);
      }
    }, null, true, 'Asia/Jakarta'); 
    job1.start();
    let a = await fastify.listen(8209, "0.0.0.0");
    // io.on('connection', async function (socket) {
    //   console.log('Socket Connect::' + socket.id);

    //   socket.on('disconnect', async function () {
    //     console.log('Socket Disconn::' + socket.id);
    //   })
    // })
    // await fastify.listen(serverPort, "0.0.0.0");

    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    boom.boomify(err)
    process.exit(1);
  }
};
start();