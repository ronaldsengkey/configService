"use strict";
const boom = require("boom");
const { set } = require("mongoose");
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

async function mainServiceAnalytic() {
    try {
        await postServiceAnalytic('account');
        await postServiceAnalytic('transaction');
        await postServiceAnalytic('notification');        
        await postServiceAnalytic('authentications');
        await postServiceAnalytic('backend');
        await postServiceAnalytic('withdraw');
        await postServiceAnalytic('outlet');
        await postServiceAnalytic('wallet');
    } catch (err) {
        console.log('error post analytic =>',err)
    }        
} 
async function postServiceAnalytic(data) {
    try {
        var server;
        if(data == "account"){
            server = process.env.ACCOUNT_SERVER;
        }else if(data == "transaction"){
            server = process.env.TRANSACTION_SERVER;
        }else if(data == "notification"){
            server = process.env.NOTIFICATION;
        }else if(data == "authentications"){
            server = process.env.AUTHENTICATIONS_SERVER;
        }else if(data == "backend"){
            server = process.env.BACKEND_SERVER;
        }else if(data == "withdraw"){
            server = process.env.WITHDRAW_SERVER;
        }else if(data == "outlet"){
            server = process.env.OUTLET_SERVER;
        }else if(data == "wallet"){
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
        console.log('error post analytic =>',err)
    }        
}
async function createServiceAnalytic(data) {
  let res = {};
  try {
    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });
    // mongoose.set('debug', false);
    await serviceParent.findOneAndUpdate({"serviceName": data.serviceName, "domain": data.domain, "category": "service"}, {
      $set: {
        status: data.status
      }
    })
    
    // Declare data object to save
    let newServiceAnalytic = new serviceAnalytic({
      serviceName: data.serviceName,
      // responseCode: data.responseCode,
      status: data.status,
      cpuProfiling: data.cpuProfiling,
    });

    let na = await newServiceAnalytic.save();
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
  
module.exports = {
  createServiceAnalytic,
  deleteServiceAnalytic,
  mainServiceAnalytic,
  postServiceAnalytic
};