#!/usr/bin/nodejs

var ROSLIB = require('roslib');
WebSocket = require('ws')
var assign = require('object-assign');

window = global
window.BlobBuilder = require("BlobBuilder")
location = {protocol: 'http'}

BinaryPack = require("binary-pack")
XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var wrtc = require('electron-webrtc')()

RTCPeerConnection = wrtc.RTCPeerConnection;
RTCSessionDescription = wrtc.RTCSessionDescription;
RTCIceCandidate = wrtc.RTCIceCandidate;

var Peer = require('peerjs')

/** SocketPeerAdapter ********************************************************/

function SocketPeerAdapter(client, callback)
{
  return {
    onopen: function onOpen(event)
    {
      client.isConnected = true;
      client.emit('connection', event);
    },

    onclose: function onClose(event)
    {
      client.isConnected = false;
      client.emit('close', event);
    },

    onerror: function onError(event)
    {
      client.emit('error', event);
    },

    onmessage: function onMessage(data)
    {
      callback(data.data);
    }
  };
}

/** PeerROS ******************************************************************/

function PeerROS(options)
{
  options = options || {};
  this.socket = null;
  this.idCounter = 0;
  this.isConnected = false;

  if (typeof options.groovyCompatibility === 'undefined')
  {
    this.groovyCompatibility = true;
  }
  else
  {
    this.groovyCompatibility = options.groovyCompatibility;
  }

  this.setMaxListeners(0);

  if (options.url && options.onmessage)
  {
    this.connect(options.url, options.onmessage);
  }
}

PeerROS.prototype.__proto__ = ROSLIB.Ros.prototype;

PeerROS.prototype.connect = function(url, onmessage)
{
  this.socket = assign(new WebSocket(url), SocketPeerAdapter(this, onmessage));
}

/** RosbridgePeer ************************************************************/

function RosbridgePeer(id, options)
{
  this.id = id;
  this.options = options;
  this.peer = null;

  this.peer = new Peer(this.id, this.options);
  this.peer.on('open', this.handlePeerOpen);
  this.peer.on('connection', this.handlePeerConnection);
  this.peer.on('error', this.handlePeerError);
}

RosbridgePeer.prototype.handlePeerOpen = function(id)
{
  console.log("[INFO]: RosPeerJs: You are connected to the peer: " + id);
}

RosbridgePeer.prototype.handlePeerConnection = function(connection)
{
  var metadata = connection.metadata;

  new ROSPeerConnection(connection);

  // if (metadata.password === password)
  // {
  //   new ROSPeerConnection(connection);
  // }
  // else
  // {
  //   connection.on('open', function()
  //   {
  //     connection.close();
  //   });
  // }
}

RosbridgePeer.prototype.handlePeerError = function(err)
{

}

/** ROSPeerConnection ********************************************************/

function ROSPeerConnection(connection)
{
  this.connection = connection;
  this.connection.serialization='none';

  this.ros = new PeerROS({
    url: 'ws://127.0.0.1:9090',
    onmessage: this.handleROSData.bind(this),
  });

  this.ros.on('connection', this.handleROSConnection.bind(this));
  this.ros.on('error', this.handleROSError.bind(this));
  this.ros.on('close', this.handleROSClose.bind(this));

  this.connection.on('open', this.handleClientConnection.bind(this));
  this.connection.on('data', this.handleClientData.bind(this));
  this.connection.on('close', this.handleClientClose.bind(this));
}

ROSPeerConnection.prototype.handleClientConnection = function()
{

}

ROSPeerConnection.prototype.handleClientData = function(data)
{
  console.log(data);
  this.ros.socket.send(data);
}

ROSPeerConnection.prototype.handleClientClose = function()
{
  this.ros.close();
}

ROSPeerConnection.prototype.handleROSConnection = function(peer_id, data)
{

}

ROSPeerConnection.prototype.handleROSData = function(data)
{
  this.connection.send(data);
}

ROSPeerConnection.prototype.handleROSClose = function(peer_id)
{
  this.connection.close();
}

ROSPeerConnection.prototype.handleROSError = function(error)
{
  this.connection.close();
}

/** Main *********************************************************************/

process.on('uncaughtException', function (err)
{
  if ('code' in err && err.code === 'ECONNREFUSED')
  {
    console.log('error: retry');
    var peer = new RosbridgePeer(argv.id, options);
  }
  else
  {
      // console.log(err);
  }
});

var argv = require('minimist')(process.argv.slice(2));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var options = {
  key: argv.key,
  port: argv.port,
  host: argv.host,
  secure: true,
  debug: 0,
}

console.log('[INFO]: RosPeerJs: id: ' + argv.id);
console.log('[INFO]: RosPeerJs: password: ' + argv.password);
console.log('[INFO]: RosPeerJs: host: ' + argv.host);
console.log('[INFO]: RosPeerJs: port: ' + argv.port);

var password = argv.password;

var peer = new RosbridgePeer(argv.id, options);
