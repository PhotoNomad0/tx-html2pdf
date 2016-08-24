'use strict';

var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var AWS = require('aws-sdk');
var config = require('./config.js');
var https = require('https');
var http = require('http');
var url = require("url");
var path = require("path");
var AdmZip = require('adm-zip');
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

    var working_dir = '/tmp/'+console.aws_request_id;
    mkdirp(working_dir);
    if(/^https{0,1}:\/\//.test(source)){
        var parsed = url.parse(source);
        var filename = working_dir+"/"+path.basename(parsed.pathname);
        request(url).pipe(filename)
        if(/\.zip$/.test(filename)) {
            var zip = new AdmZip(filename);
            zip.extractAllTo(working_dir, true);
        }
    }
    else {
        fs.writeFile(workint_dir+"/"+job.job_id+"."+job.input_format, source, 'utf8');
    }

    var tempFile = '/tmp/' + context.aws_request_id + "." + job.output_format;
    var writeStream = fs.createWriteStream(tempFile);

    //wkhtmltopdf(source, {pageSize: options.page_size, lineSpacing: options.line_spacing}, (err, stream) => {
    wkhtmltopdf(workingDir+'/*.html', {pageSize: options.page_size}, (err, stream) => {
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
