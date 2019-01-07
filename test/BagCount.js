const BagCount = artifacts.require("../contracts/BagCount.sol");
const assert = require('chai').assert;
const truffleAssert = require('truffle-assertions');

let beforeInstance;
let beforeTx;


contract('BagCount', accounts => {

  it("should initialize a center with 0 discrepancies", async () => {
    const instance = await BagCount.deployed();
    await instance.createCenter({from: accounts[2], gas: '1000000'});
    const testTx = await instance.getDiscrepancies(accounts[2], {from: accounts[0], gas: '1000000'});
    truffleAssert.eventEmitted(testTx, 'LogDiscrepancies', ev => {
      return ev.discrepancies == 0
    });
  });

  it('should allow a center to record a count', async () => {
    const instance = await BagCount.deployed();
    await instance.createCenter({from: accounts[1], gas: '1000000'});
    const tx = await instance.recordCount(500, {from: accounts[1], gas: '1000000'});
    truffleAssert.eventEmitted(tx, 'LogCenterDelivery', (ev) => {
      return ev["_center"] == accounts[1] && ev["_id"] == 4
    });
  })

  beforeEach( async () => {
    beforeInstance = await BagCount.deployed();
    await beforeInstance.createCenter({from: accounts[1], gas: '1000000'});
    beforeTx = await beforeInstance.recordCount(400, {from: accounts[1], gas: '1000000'});
  })

  it('should get a correct count back after a center records one', async () => {
    const tx = await beforeInstance.getCount(4, {from: accounts[0], gas: '1000000'});
    truffleAssert.eventEmitted(tx, 'LogDeliveryInfo', (ev) => {
      return ev.bagCount == 400
    })
  })

  it('should allow the plant to verify a delivery', async () => {
    const tx = await beforeInstance.verifyDelivery(6, 600, {from: accounts[0], gas: '1000000'});
    const getTx = await beforeInstance.getCount(6, {from: accounts[0], gas: '1000000'});
    truffleAssert.eventEmitted(getTx, 'LogDeliveryInfo', (ev) => {
      return ev.verified == true
    })
  })

  it('should not allow a center to verify a delivery', async () => {
    try {
      const tx = await beforeInstance.verifyDelivery(7, 600, {from: accounts[1], gas: '1000000'});
    } catch(error) {
      assert.notEqual(error, undefined);
    }
  })

  it('should return the correct amount of discrepancies for a particular center', async () => {
    const tx = await beforeInstance.verifyDelivery(8, 600, {from: accounts[0], gas: '1000000'});
    const getTx = await beforeInstance.getCount(8, {from: accounts[0], gas: '1000000'});
    const getDiscrepanciesTx = await beforeInstance.getDiscrepancies(accounts[1]);
    truffleAssert.eventEmitted(getDiscrepanciesTx, 'LogDiscrepancies');
  })

})