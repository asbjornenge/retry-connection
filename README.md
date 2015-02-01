# retry-connection

This module takes a **host** and a **port** and will keep checking that connection on a given interval.

## Install

    npm install retry-connection

## Use

    var conn = require('retry-connection')({
        host     : 'some.host',
        port     : 8000,
        interval : 1000, // (default 1000)
        timeout  : 500   // (default 500)
    })
    conn.on('ready', function() {})
    conn.on('issue', function(issue) {})

The module holds internal state about readiness; meaning it will only emit a ready event on initial connection
or after an issue has occurred. While the connection keeps being ready, no new ready event is emitted.
Issue events however keep being emitted for each failing attempt.

enjoy
