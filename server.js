'use strict'
const path = require('path');
const gateway = require('express-gateway');
const fastify = require('fastify')({ logger: true });
const axios = require('axios');

gateway()
  .load(path.join(__dirname, 'config'))
  .run();

  fastify.post('/internalAccess/:params', async (request, reply) => {
    console.log(request.body)
    let p = request.params.params ;
    return p;
  });


  fastify.post('/login/authentications/:params', async (request, reply) => {
    // console.log(request.body.params.email, request.body.params.password,'>>>', request.params.params);
    // console.log('>>>', 'http://192.168.0.9:8202/authentications/login/'+request.params.params);
    let url = 'http://localhost:8202/authentications/login/'+request.params.params;
    // console.log(url);
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