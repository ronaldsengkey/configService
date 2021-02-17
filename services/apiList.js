"use strict";
const boom = require("boom");
let response = require("../routes/response"),
  mongoose = require("mongoose").set("debug", true),
  mongoConf = require("../config/mongo"),
  apiSchema = require("./serviceParentSchema"),
  childSchema = require("./serviceChildSchema"),
  fs = require("fs"),
  pubKey = fs.readFileSync("./publicKey.key", "utf8"),
  Cryptr = require("cryptr"),
  cryptr = new Cryptr(pubKey),
  data = "";
let io = require('./socketServer').io;

async function test2(request, reply) {
  try {
    io.emit('tes', 'tes');
    return "Hello World test 2 !!";
  } catch (err) {
    console.log(err)
  }
}

async function test3(request, reply) {
  try {
    return "Hello World test 3 !!";
  } catch (err) {
    console.log(err)
  }
}

async function apiList(request, reply) {
  try {
    // Filter access request
    let query = '';
    let param = request.params.param;
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });
    // let query = await apiSchema.find({
    //   fieldTypeOrigin: param,
    // });
    var f = {}

    if(param != 'all'){
      f = {
        "category": param
      }
    }
    query = await apiSchema.find(f);
    if (query.length > 0) {
      // Return response
      await mongoose.connection.close();
      return response.ok(query, "Getting acces success", reply);
    } else {
      return response.notfound(
        "",
        "sory data not found, please check your parameter",
        reply
      );
    }
    // console.log('FIELD NAME ==> ',cryptr.decrypt('5b67e3f950b8bdf8a0f666dfa7e6af2842ba3f2dcc7573a88dda22960f597b0095191ce8a008b44bbe3e8739291ac601eea0013fff688ae71d6a25159bcfd90ec91613ee747ddab47e9afe37b885d2976b58690c18a4c159ed1b3afd89fb62a2cd9e974aaccd4deff684c504f7a485f4'))
  } catch (err) {
    console.log('Error ==> ', err)
    boom.boomify(err);
    return response.serverError(err, "Internal server error", reply);
  }
}

async function createApi(request, reply) {
  try {
    // Get body pot
    console.log('REQUEST ===> ', request.body)
    let param = request.body,
      fieldName = cryptr.encrypt(param.fieldName),
      fieldValue = cryptr.encrypt(param.fieldValue),
      fieldType = cryptr.encrypt(param.fieldType);

    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });

    // Declare data object to save
    let newApi = new apiSchema({
      fieldName: fieldName,
      fieldValue: fieldValue,
      fieldType: fieldType,
      fieldNameOrigin: param.fieldName,
      fieldValueOrigin: param.fieldValue,
      fieldTypeOrigin: param.fieldType,
      status: 1,
    });

    let na = await newApi.save();
    await mongoose.connection.close();
    if (na) {
      return response.ok(na, "New config created", reply);
    } else {
      return response.serverError(err, "Internal server error", reply);
    }
  } catch (err) {
    boom.boomify(err);
    return response.serverError(err, "Internal server error", reply);
  }
}
async function createParentService(request, reply) {
  try {
    // Get body pot
    let param = request.body

    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });

    // Declare data object to save
    let newApi = new apiSchema({
      serviceName: param.serviceName,
      domain: param.domain,
      port: param.port,
      server: param.server,
      category: param.category,
      status: "on"
    });

    let na = await newApi.save();
    await mongoose.connection.close();
    if (na) {
      return response.ok(na, "New Parent Service created", reply);
    } else {
      return response.serverError(err, "Internal server error", reply);
    }
  } catch (err) {
    boom.boomify(err);
    return response.serverError(err, "Internal server error", reply);
  }
}

async function updateParentService(request, reply) {
  try {
    // Get body pot
    let param = request.body

    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });

    let paramFind = {
      serviceName: param.serviceName
    };
    let na= await apiSchema.findOneAndUpdate(paramFind, {
        $set: {
          domain: param.domain,
          port: param.port,
          server: param.server
        }
    }, {
        useFindAndModify: false
    });

    await mongoose.connection.close();
    if (na) {
      return response.ok(na, "Parent Service updated", reply);
    } else {
      return response.serverError(err, "Internal server error", reply);
    }
  } catch (err) {
    boom.boomify(err);
    return response.serverError(err, "Internal server error", reply);
  }
}

async function createChildService(request, reply) {
  try {
    // Get body pot
    let param = request.body

    // Run mongoose connection
    await mongoose.connect(mongoConf.mongoDb.url, {
      useNewUrlParser: true,
    });

    // Declare data object to save
    let newApi = new childSchema({
      serviceName: param.serviceName,
      category: param.category,
      path: param.path,
      server: param.server,
    });

    let na = await newApi.save();
    await mongoose.connection.close();
    if (na) {
      return response.ok(na, "New Child Service created", reply);
    } else {
      return response.serverError(err, "Internal server error", reply);
    }
  } catch (err) {
    boom.boomify(err);
    return response.serverError(err, "Internal server error", reply);
  }
}


module.exports = {
  apiList,
  createApi,
  createParentService,
  updateParentService,
  createChildService,
  test2,
  test3
};