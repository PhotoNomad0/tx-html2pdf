'use strict';

var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var AWS = require('aws-sdk');
var https = require('https');
var http = require('http');
var url = require("url");
var path = require("path");
var unzip = require('unzip');
var mkdirp = require('mkdirp');
var request = require('request');

var s3 = new AWS.S3();

exports.handle = function (event, context, callback) {
    console.log(event);

    if (!event.data.job) {
        var msg = '"job" was not in payload';
        console.error(msg);
        callback(msg, {});
        return;
    }
    var job = event.data.job

    if (!job.source) {
        var msg = '"source" was not in "job"';
        console.error(msg);
        callback(msg, {});
        return;
    }
    var source = job.source;

    if (!event.data.s3_bucket) {
        var msg = '"s3_bucket" was not payload';
        console.error(msg);
        callback(msg, {});
        return;
    }
    var dstBucket = event.data.s3_bucket;

    if (!event.data.s3_file) {
        var msg = '"s3_file" was not in payload';
        console.error(msg);
        callback(msg, {});
        return;
    }
    var outputFile = event.data.s3_file

    console.info('source: ' + source);
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

    var workingDir = '/tmp/'+context.awsRequestId;
    var inputFile = '';
    mkdirp(workingDir);
    if(/^https{0,1}:\/\//.test(source)){
        var parsed = url.parse(source);
        var filename = workingDir+"/"+path.basename(parsed.pathname);
        request(source).pipe(fs.createWriteStream(filename))
        fs.writeFile(filename, source, 'utf8');
        if(/\.zip$/.test(filename)) {
            fs.createReadStream(filename).pipe(unzip.Extract({ path: workingDir }));
        }
    }
    else {
        inputFile = workint_dir+"/"+job.job_id+"."+job.input_format;
        fs.writeFile(inputFile, source, 'utf8');
    }

    var tempFile = '/tmp/' + context.awsRequestId + "." + job.output_format;
    var writeStream = fs.createWriteStream(tempFile);

    //wkhtmltopdf(source, {pageSize: options.page_size, lineSpacing: options.line_spacing}, (err, stream) => {
    wkhtmltopdf(fs.createReadStream(workingDir+'/test.html)', {pageSize: options.page_size}, (err, stream) => {
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

    callback({}, {'success': true})
};
