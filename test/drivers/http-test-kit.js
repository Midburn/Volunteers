const express = require('express'),
  url = require('url'),
  thenify = require('thenify'),
  http = require('http');

exports.server = options => new HttpTestkit;

const defaultPort = 3305;

class HttpTestkit {
  constructor() {
    this.port = defaultPort;
    this.app = express().disable('x-powered-by');
  }

  start() {
    const app = this.app;
    this.server = http.createServer(app);
    return this.server.listen(this.getPort(), err => err ? Promise.reject(err) : Promise.resolve());
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        return err ? reject(err) : resolve();
      });
    });
  }

  getApp() {
    return this.app;
  }

  getUrl(path) {
    const baseUrl = `http://localhost:${this.getPort()}`;
    return path ? url.resolve(baseUrl, path) : baseUrl;
  }

  getPort() {
    return this.port;
  }


}