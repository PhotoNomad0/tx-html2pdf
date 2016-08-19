'use strict';

var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var AWS = require('aws-sdk');
var config = require('./config.js');

var s3 = new AWS.S3();

exports.handle = function (event, context, callback) {
    if (!event.job) {
        console.error('unable to get the job');
        callback('unable to get the job', {});
        return
    }
    var job = event.job

    if (!job.source) {
        console.error('unable to get the source from the job');
        callback('unable to get the source from the job', {});
        return
    }
    var source = job.source

    if (!event.bucket) {
        console.error('unable to get the bucket');
        callback('unable to get the bucket', {});
        return
    }
    var dstBucket = event.bucket

    if (!event.output_file) {
        console.error('unable to get the output_file');
        callback('unable to get the output_file', {});
        return
    }
    var outputFile = event.output_file

    console.info('source url: ' + source);
    console.info('dstBucket: ' + dstBucket);
    console.info('outputFile: ' + outputFile);

    var options = {
       'page_size': 'letter',
       'line_spacing': '120%'
    };

    if (job.options) {
       for (var attrname in job.options) { 
           options[attrname] = job.options[attrname]; 
       }
    }

    var tempFile = '/tmp/' + context.aws_request_id;
    var writeStream = fs.createWriteStream(tempFile);

    //wkhtmltopdf(source, {pageSize: options.page_size, lineSpacing: options.line_spacing}, (err, stream) => {
    wkhtmltopdf(source, {pageSize: options.page_size}, (err, stream) => {
        s3.putObject({
            Bucket: dstBucket,
            Key: outputFile,
            Body: fs.createReadStream(tempFile),
            ContentType: 'application/pdf'
        }, (error, data) => {
            if (error != null) {
                console.error('error=' + error);
                callback('unable to send file to S3', {});
            } else {
                console.info('upload done...');
                callback(null, { filename: outputFile });
            }
        });
    }).pipe(writeStream);
};
