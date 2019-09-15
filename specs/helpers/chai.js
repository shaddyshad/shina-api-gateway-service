'use strict';

var chai = require('chai');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
