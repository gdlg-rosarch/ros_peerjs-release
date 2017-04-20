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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var options = {
  key: 'peerjs',
  port: 9000,
  host: 'peer.oros.io',
  secure: true,
  debug: 3,
}

var peer = new Peer(options);

peer.on('open', function()
{
  console.log('open');
});

peer.on('connection', function()
{
  console.log('connection');
});

peer.on('error', function()
{
  console.log('error');
});

conn = peer.connect('my_robot', {metadata: {password: 'my_password'}});

conn.on('data', function(data)
{
  console.log(data);
});

conn.on('open', function()
{
  // conn.send('hello');
});
