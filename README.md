
## App one to share cookies

This app allow to create a cookie, and try to send via fetch method to other app2 (https://github.com/jmmartin81/cookie-share-two).
The intent of this two apps is to share cookies between domain, we cannot prove it works.

This app will run on port 3001, on the route index will have two button

```bash

One to create a cookie
Second to send cookie to app2

First you must to create the cookie with the first button, and then send it with the second button.
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

```

## To use it on Ngrok 

Must follow the following article:

https://medium.com/@singhgautam7/ngrok-make-full-use-of-free-tier-version-to-expose-your-localhost-to-the-internet-1160e652d794

Ngrok yml must be like:

```bash
    version: "2"
    authtoken: <yourToken>
    tunnels:
    first:
        addr: 3001
        proto: http 
        host_header: "rewrite"
    second:
        addr: 3002
        proto: http
        host_header: "rewrite"
```

To run ngrok:
```bash
ngrok start --all
```

## Changes to Make to the code 

The follows files must be replace the urls with ngrok urls will give to you when it runs.

```bash 
index.jade lines 12 and 25.
index.js on line 12.
app.js on line 13.
```