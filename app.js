/*
 [Copyright](c) 2020 Pickedianz AKA Sandy Hermansyah.
 */

"use strict";

const runtime = require('child_process');
require('dotenv').config();

let fps, encoder, res, video, rtmp, bitrate;
// Validate the input parameters
if (process.env.TYPE_RESOLUTION_STREAM !== 'FIXED_RESOLUTION' && process.env.TYPE_RESOLUTION_STREAM !== 'CUSTOM_RESOLUTION') {
    console.info('TYPE_RESOLUTION_STREAM type is not available [FIXED_RESOLUTION or CUSTOM_RESOLUTION]');
    process.exit(1);
}

if (!process.env.RESOLUTION_STREAM || process.env.RESOLUTION_STREAM === null) {
    console.info('Please set the RESOLUTION_STREAM variable in the environment variables');
    process.exit(1);
}

if (!process.env.RTMP_DEST_KEY || process.env.RTMP_DEST_KEY === null) {
    console.info('Please, set the RTMP_DEST_KEY variable in the environment variables');
    process.exit(1);
}

if (!process.env.ENCODER_STREAM || process.env.ENCODER_STREAM === null) {
    console.info('Please, set the ENCODER_STREAM variable in the environment variables');
    process.exit(1);
}

if (!process.env.MEDIA_SRC_DEST || process.env.MEDIA_SRC_DEST === null) {
    console.info('Please, set the MEDIA_SRC_DEST variable in the environment variables');
    process.exit(1);
}

let additional_args = [];
if (process.env.ADDITIONAL_ARGS || process.env.ADDITIONAL_ARGS !== null) {
    additional_args.push(process.env.ADDITIONAL_ARGS.split(' '));
}

video = process.env.MEDIA_SRC_DEST.split(', ');
rtmp = process.env.RTMP_DEST_KEY;
fps = (process.env.FPS_STREAM ? process.env.FPS_STREAM : 30);
encoder = process.env.ENCODER_STREAM;
bitrate = process.env.BITRATE_STREAM ? process.env.BITRATE_STREAM : 1000;
if (video.length > 1 && process.env.INFINITY_LOOP === 'true') {
    console.info('Please, if you want to use the infinity loop, you must set the MEDIA_SRC_DEST variable only with one video');
    process.exit(1);
}

switch (process.env.TYPE_RESOLUTION_STREAM) {
    case 'FIXED_RESOLUTION':
        res = '1920:1080';
        break;
    case 'CUSTOM_RESOLUTION':
        res = (process.env.RESOLUTION_STREAM === null ? process.env.RESOLUTION_STREAM.replace("x", ":") : '1920:1080');
        break;
    default:
        res = '1920:1080';
        break;
}

let args_ffmpeg = ['-y'];

function buildMultiSourceCommand(videoList) {
    let commands = [];
    let sourceCount = 0;
    let inputs = [];
    videoList.forEach(function (input) {
        inputs.push('-i', input);
        sourceCount++;
    });

    commands.push(inputs);

    commands.push('-filter_complex');
    let filter_complex = '';
    for (let i = 0; i < sourceCount; i++) {
        filter_complex += '[' + i + ':v]settb=AVTB,fps=' + fps + '/1,scale=' + res + ':force_original_aspect_ratio=decrease,pad=' + res + ':(ow-iw)/2:(oh-ih)/2,setsar=1[v' + i + '];';
    }
    for (let i = 0; i < sourceCount; i++) {
        filter_complex += '[v' + i + '] [' + i + ':a] ';
    }
    filter_complex += 'concat=n=' + sourceCount + ':v=1:a=1[v] [a]';

    commands.push(filter_complex, '-map', '[v]', '-map', '[a]');

    return commands;
}
if (process.env.INFINITY_LOOP === 'true') {
    console.log('Loop: Infinity loop enabled');
    args_ffmpeg.push('-stream_loop', '-1');
} else {
    console.log('Loop: Infinity loop disabled');
}

// Push build multi source command and flatten the array.
args_ffmpeg.push(buildMultiSourceCommand(video).flat());

// Push other arguments and rtmp destination.
args_ffmpeg.push('-vcodec', 'libx264', '-refs', '0', '-f', 'flv', '-flvflags', 'no_duration_filesize', '-r', fps, '-pix_fmt', 'yuv420p', additional_args.flat(), '-c:v', encoder, '-b:v', bitrate + 'k', '-crf', '28', '-g', '60', '-c:a', 'aac', rtmp);

console.log('Starting stream...');
console.log('FFMPEG command: ffmpeg ' + args_ffmpeg);
// Start the stream with ffmpeg and flatten the array.
let ffmpeg = runtime.spawn('ffmpeg', args_ffmpeg.flat());

ffmpeg.on('exit', (code, signal) => {
    if (code === 0) {
        console.log(`FFMPEG transcoder exited with code ${code}, signal ${signal}`);
    }
});

ffmpeg.on('error', (err) => {
    console.log(`FFMPEG transcoder error: ${err}`);
});

if (process.env.SHOW_VERBOSE === 'true') {
    ffmpeg.stderr.on('data', (data) => {
        process.stdout.write(data.toString());
    });
} else {
    console.log('FFMPEG transcoder started');
}