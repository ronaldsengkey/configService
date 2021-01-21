const request = require('request');

exports.sendRequest = function sendRequest(options){
    console.log("sentRequest::", options);
    return new Promise(async function(resolve){
        request(options, function (error, response) {
            if (error) {
                console.log('error::', error);
                return resolve(false);
            }
            console.log('response::', response.body);
            return resolve(response.body);
        });
    })
}