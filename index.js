var assign       = Object.assign || require('object.assign')
var dns          = require('dns')
var tcpp         = require('tcp-ping')
var EventEmitter = require('events').EventEmitter

var RetryConnection = function(options) {
    this.ready    = false
    this.host     = options.host
    this.port     = options.port
    this.timeout  = options.timeout  || 500
    this.interval = options.interval || 1000
}
RetryConnection.prototype = assign({

    connect : function() {
        setInterval(function() {
            this.tryConnection()
        }.bind(this), this.interval)
        this.tryConnection()
    },

    tryConnection : function() {
        this.tryResolve(function(err) {
            if (err) { this.handleError('dns'); return }
            this.tryTcp(function(err) {
                if (err) { this.handleError('tcp'); return }
                this.handleSuccess()
            }.bind(this))
        }.bind(this))
    },

    tryResolve : function(callback) {
        dns.resolve4(this.host, function(err, addresses) {
            callback(err)
        }.bind(this))
    },

    tryTcp : function(callback) {
        tcpp.ping({ address : this.host, port : this.port, timeout : this.timeout, attempts : 1 }, function(err, data) {
            callback(data.results[0].err)
        }.bind(this))
    },

    handleError : function(type) {
        var msg;
        if (type === 'dns') msg = 'Unable to resolve '+this.host
        if (type === 'tcp') msg = 'Unable to connect to '+this.host+' on port '+this.port
        this.ready = false
        this.emit('issue', {
            type    : type,
            message : msg
        })
    },

    handleSuccess : function() {
        if (this.ready) return
        this.ready = true
        this.emit('ready')
    }

}, EventEmitter.prototype)

module.exports = function(host, port) { return new RetryConnection(host, port)  }
