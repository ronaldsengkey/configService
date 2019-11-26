'use strict'
const path = require('path');
const gateway = require('express-gateway');
const fastify = require('fastify')({ logger: true });

gateway()
  .load(path.join(__dirname, 'config'))
  .run();

  fastify.get('/test/', async (request, reply) => {
    console.log('test pak eko');
    return { hello: 'pak eko' }
  })

  fastify.get('/test/log', async (request, reply) => {
    console.log('masuk pak eko');
    return { hello: 'world' }
  })

  const start = async () => {
    try {
      await fastify.listen(3000)
      fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()