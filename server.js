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

// async function actionPost(data) {
//   try {
//     axios({
//       method: "post",
//       url: data.url,
//       headers: {
//         "Content-Type": "application/json",
//       },
//       data: data.content,
//     });
//   } catch (err) {
//     console.log("error action post");
//   }
// }


// fastify.post("/internalAccess/:params/:accountName", async (request, reply) => {
//   console.log();
//   let data = {};
//   let p = request.params.params;
//   let acn = request.query.accountName;
//   data.content = request.body;
//   console.log(data);
//   // switch(p){
//   //   case "register":
//   //     data.url = {url:process.env.ACCOUNT_SERVICE_HOST+acn,}
//   //     let a = await actionPost()
//   //     break;
//   // }
//   return p;
// });

// fastify.post("/login/authentications/:params", async (request, reply) => {
//   let url =
//     "http://localhost:8202/authentications/login/" + request.params.params;
//   axios({
//     method: "post",
//     url: url,
//     data: {
//       params: {
//         email: request.body.params.email,
//         password: request.body.params.password,
//       },
//     },
//   })
//     .then(async function (response) {
//       console.log("=========>", response);
//       // try{
//       //   await createCKA(response)
//       // }
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
//   return { hello: "pak eko" };
// });

const start = async () => {
  try {
    fastify.use(helmet());

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