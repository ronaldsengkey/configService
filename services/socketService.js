const reqService = require('./requestService');

exports.getTicketing = async function (){
    try {
        var options = {
            'method': 'GET',
            'url': process.env.BACKEND_SERVER + '/backend/socket/ticketing',
            'headers': {
                'code': process.env.SERVICE_CODE
            }
        };
        let result = await reqService.sendRequest(options);
        result = JSON.parse(result);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            console.log("result.data::", result.data);
            return result.data  
        } else {
            return false
        }  
    } catch (error) {
        console.log('error::', error);
        return false;
    }
}