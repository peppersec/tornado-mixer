const FeeManager = artifacts.require('./FeeManager.sol')
const {toBN} = require('web3-utils')

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const expectEqual = (actual, expected) => assert(expected === actual, `Expected ${expected}, got: ${actual}`)

contract('FeeManager', accounts => {
  let feeManager

  before(async () => {
    feeManager = await FeeManager.deployed()
  })

  describe("#setFeeTo", () => {
    it('should fail when sender is not `feeToSetter`', async () => {
      try {
        await feeManager.setFeeTo(accounts[1], {from: accounts[1]})
      } catch (e) {
        assert(e.message.includes("Poof: FORBIDDEN"), `Unexpected error: ${e.message}`)
      }

      const feeTo = await feeManager.feeTo()
      expectEqual(feeTo, ZERO_ADDRESS)
    })

    it('should work', async () => {
      await feeManager.setFeeTo(accounts[1], {from: accounts[0]})
      const feeTo = await feeManager.feeTo()
      expectEqual(feeTo, accounts[1])
    })
  })

  describe("#setFeeToSetter", () => {
    it('should fail when sender is not `feeToSetter`', async () => {
      try {
        await feeManager.setFeeToSetter(accounts[1], {from: accounts[1]})
      } catch (e) {
        assert(e.message.includes("Poof: FORBIDDEN"), `Unexpected error: ${e.message}`)
      }

      const feeToSetter = await feeManager.feeToSetter()
      expectEqual(feeToSetter, accounts[0])
    })

    it('should work', async () => {
      await feeManager.setFeeToSetter(accounts[1], {from: accounts[0]})
      const feeToSetter1 = await feeManager.feeToSetter()
      expectEqual(feeToSetter1, accounts[1])

      await feeManager.setFeeToSetter(accounts[0], {from: accounts[1]})
      const feeToSetter2 = await feeManager.feeToSetter()
      expectEqual(feeToSetter2, accounts[0])
    })
  })

  describe("#setProtocolFeeDivisor", () => {
    it('should fail when sender is not `feeToSetter`', async () => {
      try {
        await feeManager.setProtocolFeeDivisor(200, {from: accounts[1]})
      } catch (e) {
        assert(e.message.includes("Poof: FORBIDDEN"), `Unexpected error: ${e.message}`)
      }

      const protocolFeeDivisor = await feeManager.protocolFeeDivisor()
      expectEqual(protocolFeeDivisor.toString(), "0")
    })

    it('should fail when protocolFeeDivisor < `MIN_PROTOCOL_FEE_DIVISOR`', async () => {
      try {
        await feeManager.setProtocolFeeDivisor(199, {from: accounts[0]})
      } catch (e) {
        assert(e.message.includes("Poof: Protocol fee too high"), `Unexpected error: ${e.message}`)
      }

      const protocolFeeDivisor = await feeManager.protocolFeeDivisor()
      expectEqual(protocolFeeDivisor.toString(), "0")
    })

    it('should work', async () => {
      await feeManager.setProtocolFeeDivisor(200, {from: accounts[0]})
      const protocolFeeDivisor1 = await feeManager.protocolFeeDivisor()
      expectEqual(protocolFeeDivisor1.toString(), "200")

      await feeManager.setProtocolFeeDivisor(500, {from: accounts[0]})
      const protocolFeeDivisor2 = await feeManager.protocolFeeDivisor()
      expectEqual(protocolFeeDivisor2.toString(), "500")

      await feeManager.clearFee({from: accounts[0]})
      const protocolFeeDivisor3 = await feeManager.protocolFeeDivisor()
      expectEqual(protocolFeeDivisor3.toString(), "0")
    })
  })

  describe("#clearFee", () => {
    it('should fail when sender is not `feeToSetter`', async () => {
      try {
        await feeManager.clearFee({from: accounts[1]})
      } catch (e) {
        assert(e.message.includes("Poof: FORBIDDEN"), `Unexpected error: ${e.message}`)
      }

      const protocolFeeDivisor = await feeManager.protocolFeeDivisor()
      expectEqual(protocolFeeDivisor.toString(), "0")
    })
  })
})
