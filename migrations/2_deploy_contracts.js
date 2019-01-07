const BagCount = artifacts.require("BagCount");

module.exports = function(deployer) {
  deployer.deploy(BagCount);
};