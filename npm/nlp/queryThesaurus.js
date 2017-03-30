/**
 * Created by Hank on 3/25/17.
 */
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
s3 = new AWS.s3({apiVersion : '2006-03-01'});

var bucketParams = {
    Bucket : process.argv[2]
};

s3.createBucket(bucketParams, function (err, data){
    if(err){
        Debug.log(err);
    } else {
        Debug.log("Success", data.location);
    }
});