'use strict';

/**
* Change into specs folder so that file loading works.
*/
process.chdir('./specs');

var chai = require('chai');
const moment = require('moment');

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

/**
 * Internal modules
 */

 const shinaCache = require('../services/cache');


// Tests go here.
describe("Tests search public API", function(){
    it("Should send a basic get request and get warehouses", function(){
        const serverUrl = 'http://192.168.1.14:36685/v1/shina-api-gateway';
        const query = {
            services: ['long_term_storage', 'short_term_storage']
        };
        
        return chai.request(serverUrl)
            .get(`/search?services=${query.services.join(',')}`)
            .then(response => {
                expect(response).to.have.status(200);
            })
    })

    it("Should request for warehouse details for id 5d5ea0220069fc86c23d666b", function(){
        const serverUrl = 'http://192.168.1.14:36685/v1/shina-api-gateway';
        const warehouseId = '5d5ea0220069fc86c23d666b';

        return chai.request(serverUrl)
            .get(`/details/${warehouseId}`)
            .then(response => {
                expect(response).to.have.status(200);
                expect(response.body.result.warehouse).to.have.property('location');
            })
    })
});

/**
 * Test bills-v1-api
 */

 describe("Test bills API : ", function(){
     it("Sends a request for quote and receives response", function(){
        //  Setup
         const serverUrl = "http://192.168.1.14:36685/v1/shina-api-gateway";
         const startDate = moment().add(1, 'day').format();

         const body = {
             userId: '23guhCHI8WYHDwlp8uSbaocDfey2',
             warehouseId: "5d5e9f8b0069fc86c23d6668",
             type: 'recurring',
             cycle: 'weekly',
             startDate,
             units: 20
         };

        //  Execute

         return chai.request(serverUrl)
            .post('/bills/new')
            .type('form')
            .send({
                ...body
            }).then(response => {
                // Test
                expect(response).to.have.status(200);
            })
     })
 });

 /**
  * Test the middleware interfaces
  */
 
describe.skip("Tests middlewares: ", function(){
    it("Receives a link id on first request", function(){
        // Setup - make a request to api and check the response 
        const serverUrl = "http://192.168.1.14:36685/v1/shina-api-gateway";

        return chai.request(serverUrl)
            .get('/')
            .then(response => {
                expect(response).to.have.status(200);
                expect(response).to.have.header('shina-link-id');
            })
    });

    it("Receives and resends a link id on second request", function(){
        const serverUrl = "http://192.168.1.14:6170/v1/shina-api-gateway";

        // Get the link id
        return chai.request(serverUrl)
            .get('/')
            .then(response => {
                const linkId = response.header['shina-link-id'];
                // Send the link id
                return chai.request(serverUrl)
                    .get('/')
                    .set('shina-link-id', linkId)
                    .then(res => {
                        // Test 
                        expect(res.body.result).to.have.property("status", "OK");
                    })
            })
    })
});

/**
 * Tests the caching service
 */

describe("Test the caching service", function(){
    it("Saves data to a key", function(){
        // Setup 
        const key = "testKey1";
        const data = {
            test: 'OK'
        };

        return shinaCache.setData(key, data).then(() => {
            return shinaCache.getData(key).then(response => {
                expect(response).to.have.property("test", "OK");
            })
        })
    })
})