const chai = require('chai')
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised);
const {expect} = chai

global.expect = expect

