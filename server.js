'use strict'
const path = require('path');
const gateway = require('express-gateway');
const fastify = require('fastify')({ logger: true });
const axios = require('axios');
require('dotenv').config();

gateway()
  .load(path.join(__dirname, 'config'))
  .run();

async function actionPost(data){
  try{
    axios({
      method: 'post',
        url: data.url,
        headers: {
          "Content-Type": "application/json"
        },
        data: data.content
    })
  }catch(err){
    console.log('error action post');
  }
}

  fastify.post('/internalAccess/:params/:accountName', async (request, reply) => {
    console.log();
    let data = {};
    let p = request.params.params;
    let acn = request.query.accountName;
    data.content = request.body;
    console.log(data);
    // switch(p){
    //   case "register":
    //     data.url = {url:process.env.ACCOUNT_SERVICE_HOST+acn,}
    //     let a = await actionPost()
    //     break;
    // }
    return p;
  });


  fastify.post('/login/authentications/:params', async (request, reply) => {
    let url = 'http://localhost:8202/authentications/login/'+request.params.params;
      axios({
        method: 'post',
          url: url,
          data: {
            params:{
              email:request.body.params.email,
              password: request.body.params.password
            }
          }
      })
      .then(async function (response) {
        console.log("=========>",response);
        // try{
        //   await createCKA(response)
        // }
      })
      .catch(function (error) {
        console.log(error);
      });
    return { hello: 'pak eko' }
  })

  const start = async () => {
    try {
      let a = await fastify.listen(8002);
      fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()