'use strict';
const httpTestkit = require('../drivers/http-test-kit');

const server = httpTestkit.server();

describe('Local Cache Manager', () => {

  before(() => server.start());
  after(() => server.stop());
  
  it('return rejected promise in case key does not exists', () => {
    console.log('first stub test');
  });
});