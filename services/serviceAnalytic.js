"use strict";
const boom = require("boom");
const {
  set
} = require("mongoose");
const pg = require('pg');
let response = require("../routes/response"),
  mongoose = require("mongoose").set("debug", true),
  mongoConf = require("../config/mongo"),
  apiSchema = require("./apiListSchema"),
  serviceAnalytic = require("./serviceAnalyticsSchema"),
  serviceParent = require("./serviceParentSchema"),
  fs = require("fs"),
  pubKey = fs.readFileSync("./publicKey.key", "utf8"),
  Cryptr = require("cryptr"),
  cryptr = new Cryptr(pubKey),
  data = "";
let io = require('./socketServer').io;
const reqService = require('./requestService');

async function mainServiceAnalytic() {
  try {
    //await postServiceAnalytic('account');
    //await postServiceAnalytic('transaction');
    //await postServiceAnalytic('notification');        
    //await postServiceAnalytic('authentications');
    //await postServiceAnalytic('backend');
    //await postServiceAnalytic('withdraw');
    //await postServiceAnalytic('outlet');
    //await postServiceAnalytic('wallet');
  } catch (err) {
    console.log('error post analytic =>', err)
  }
}
async function postServiceAnalytic(data) {
  try {
    var server;
    if (data == "account") {
      server = process.env.ACCOUNT_SERVER;
    } else if (data == "transaction") {
      server = process.env.TRANSACTION_SERVER;
    } else if (data == "notification") {
      server = process.env.NOTIFICATION;
    } else if (data == "authentications") {
      server = process.env.AUTHENTICATIONS_SERVER;
    } else if (data == "backend") {
      server = process.env.BACKEND_SERVER;
    } else if (data == "withdraw") {
      server = process.env.WITHDRAW_SERVER;
    } else if (data == "outlet") {
      server = process.env.OUTLET_SERVER;
    } else if (data == "wallet") {
      server = process.env.WALLET_SERVER;
    }

    var ioServer = require('socket.io-client')(server);
    var socket = ioServer.connect(server);
    socket.on('createServiceAnalytic', async function (data) {
      data.domain = process.env.MONGODB_HOST;
      await createServiceAnalytic(data);
    });
    socket.on("disconnect", async function () {
      let ds = {
        "serviceName": data,
        "status": "off",
        "cpuProfiling": "{}",
        "domain": process.env.MONGODB_HOST
      }
      await createServiceAnalytic(ds);
    });

  } catch (err) {
    console.log('error post analytic =>', err)
  }
}
async function createServiceAnalytic(data) {
  console.log('createServiceAnalytic::', data);
  let res = {};
  try {
    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });
    // mongoose.set('debug', false);
    let update = await serviceParent.findOneAndUpdate({
      "serviceName": data.serviceName,
      "domain": data.domain,
      "category": "service"
    }, {
      $set: {
        status: data.status
      }
    })
    console.log("createServiceAnalytic::", update);

    // Declare data object to save
    let newServiceAnalytic = new serviceAnalytic({
      serviceName: data.serviceName,
      // responseCode: data.responseCode,
      domain: data.domain,
      status: data.status,
      cpuProfiling: data.cpuProfiling,
      category: "service",
    });

    let na = await newServiceAnalytic.save();
    console.log("na::", na);
    updateSocket({
      id: update.id,
      serviceName: data.serviceName,
      status: data.status,
      category: "service",
      cpuProfiling: data.cpuProfiling,
    });
    await mongoose.connection.close();
    if (na) {
      res.responseCode = process.env.SUCCESS_RESPONSE;
      res.responseMessage = "New service analytic created";
      res.data = na;
      return res
    } else {
      res.responseCode = process.env.ERRORINTERNAL_RESPONSE;
      res.responseMessage = "Internal server error";
      return res
    }
  } catch (err) {
    boom.boomify(err);
    res.responseCode = process.env.ERRORINTERNAL_RESPONSE;
    res.responseMessage = err;
    return res
  }
}

async function updateStatusDatabase(data) {
  let res = {};
  try {

    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true
    });
    let whereVal = {
      "serviceName": data.serviceName,
      "category": data.category
    };
    let sorting = {
      "createdDate": "-1"
    };
    let newValues = {
      "status": data.status
    };
    let a = await serviceParent.findOneAndUpdate(whereVal, {
      $set: newValues
    }, {
      new: true,
      sort: sorting
    });
    await mongoose.connection.close();
  } catch (e) {
    console.log('Error update status database ==> ', e);
    res.responseCode = process.env.ERRORINTERNAL_RESPONSE;
    res.responseMessage = 'Internal server error';
    return res;
  }
}

async function checkDatabase(data) {
  console.log('DATA => ', data.params)
  let res = {};
  let us = {};
  us.category = 'database';
  let mongo = 'off';
  let postgre = 'off';
  let pgCon = '';
  let url_mongo = '';
  let database = '';
  try {
    if (data.params.param != "postgre" && data.params.param != 'cdnSource' && data.params.param != 'configServer' && data.params.param != 'dashboard' && data.params.param != 'ewalletv1' && data.params.param != 'log' && data.params.param != 'oauth' && data.params.param != 'outlet' && data.params.param != 'ultiSend' && data.params.param != 'withdraw') {
      res.responseCode = process.env.NOTACCEPT_RESPONSE;
      res.responseMessage = 'Invalid access';
      return res;
    }
    switch (data.params.param) {
      case "postgre":
        us.serviceName = 'postgre_ewallet'
        let url_pg = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOSTNAME}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;
        console.log('URL PG => ', url_pg)
        pgCon = new pg.Client(url_pg);
        await pgCon.connect().then(function (e) {
          console.log('PG Connected')
          postgre = 'on'
        }).catch(function (err) {
          console.log('PG Failed Connect ==> ', err)
          postgre = 'off'
        })
        us.status = postgre;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = postgre

        break;
      case "cdnSource":
        us.serviceName = 'mongo_cdnSource';
        database = 'cdnSource';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        console.log('CDN SOURCE ==> ', url_mongo)
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo cdnSource ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "configServer":
        us.serviceName = 'mongo_configServer';
        database = 'configServer';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo configServer ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "dashboard":
        us.serviceName = 'mongo_dashboard';
        database = 'dashboard';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo dashboard ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "ewalletv1":
        us.serviceName = 'mongo_ewalletv1'
        database = 'ewalletv1';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo ewalletv1 ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "log":
        us.serviceName = 'mongo_log'
        database = 'log';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo log ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "oauth":
        us.serviceName = 'mongo_oauth'
        database = 'oauth';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo oauth ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "outlet":
        us.serviceName = 'mongo_outlet'
        database = 'outlet';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo outlet ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "ultiSend":
        us.serviceName = 'mongo_ultiSend'
        database = 'ultiSend';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo ultiSend ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
      case "withdraw":
        us.serviceName = 'mongo_withdraw'
        database = 'withdraw';
        url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        // url_mongo = `mongodb://${process.env.MONGODB_USERNAME}:"hahahaha"@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${database}?authSource=admin`;
        await mongoose
          .connect(url_mongo, {
            useNewUrlParser: true,
          })
          .then(function (e) {
            console.log("MONGO CONNECTED");
            mongo = 'on';
          }).catch(err => {
            console.log('Error connect mongo withdraw ==> ', err)
          });
        us.status = mongo;
        updateStatusDatabase(us);
        res.responseCode = process.env.SUCCESS_RESPONSE
        res.responseMessage = 'Success check database'
        res.status = mongo
        break;
    }
    return res;
  } catch (e) {
    console.log('Error checking database on config service ==> ', e);
    res.responseCode = process.env.ERRORINTERNAL_RESPONSE;
    res.responseMessage = 'Internal server error';
    return res;
  }
}

async function deleteServiceAnalytic() {
  let res = {};
  try {
    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });

    // Declare data object to save
    let newServiceAnalytic = new serviceAnalytic({
      serviceName: data.serviceName,
      // responseCode: data.responseCode,
      status: data.status,
      cpuProfiling: data.cpuProfiling,
    });

    let query = await serviceAnalytic.deleteMany({});
    await mongoose.connection.close();
    if (query === null) {
      return process.env.NOTFOUND_RESPONSE;
    } else {
      return query
    }
  } catch (err) {
    boom.boomify(err);
    res.responseCode = process.env.ERRORINTERNAL_RESPONSE;
    res.responseMessage = err;
    return res
  }
}

async function getApiService() {
  try {
    let result = [];
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });
    let datas = await serviceParent.find({});
    for (let data of datas) {
      console.log('data::', data.hostName);
      result.push({
        id: data._id,
        serviceName: data.serviceName,
        domain: data.domain,
        hostName: data.hostName,
        port: data.port,
        server: data.server,
        category: data.category,
        status: data.status,
        type: data.type,
        performance: await serviceAnalytic.find({
          serviceName: data.serviceName,
          domain: data.domain
        }).sort({
          'createdDate': -1
        }).limit(10)
      })
    }
    await mongoose.connection.close();
    console.log('data::', result);
    return result;
  } catch (error) {
    console.log('error::', error);
    return error;
  }
}

async function updateSocket(data) {
  var options = {
    'method': 'GET',
    'url': process.env.CONFIG_SERVER + '/update/service',
    'headers': {
      'param': JSON.stringify(data),
      'code': process.env.SERVICE_CODE
    }
  };
  reqService.sendRequest(options);
}

module.exports = {
  createServiceAnalytic,
  deleteServiceAnalytic,
  mainServiceAnalytic,
  postServiceAnalytic,
  getApiService,
  checkDatabase
}