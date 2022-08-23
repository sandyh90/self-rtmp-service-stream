<h1 align="center">Self Broadcast Streaming</p>

<h3 align="center">Easy way for broadcast video and media to RTMP service.</h3>

# Introduction

This project supports any device and Heroku too, it can be used to test live streaming and check streaming provider connection if you have plans for 24/7 live.

# Manual

## .env Example

```
RTMP_DEST_KEY=""
INFINITY_LOOP=false
ENCODER_STREAM="libx264"
FPS_STREAM="60"
SHOW_VERBOSE=true
RESOLUTION_STREAM="1920x1080"
TYPE_RESOLUTION_STREAM="FIXED_RESOLUTION"
BITRATE_STREAM=1500
MEDIA_SRC_DEST=""
ADDITIONAL_ARGS=""
```

## Running command
If you wanna run this file on your server or computer, Please use this command.
`node start` or `node app.js`

# Heroku & Other Saas
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/sandyh90/self-rtm-service-stream)

_Note: Use this at your own risk your account may be banned or suspended if you abuse their service due to their terms of service._
