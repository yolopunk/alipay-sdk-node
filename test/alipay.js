/* eslint-env mocha */

'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Alipay = require('../lib/alipay')
const alipay = new Alipay({
  app_id: '2016091800538651',
  app_private_key: fs.readFileSync(path.join(__dirname, 'app_private_key.pem')),
  alipay_public_key: fs.readFileSync(path.join(__dirname, 'alipay_public_key.pem')),
  sign_type: 'RSA2',
  notify_url: 'http://notify.url',
  return_url: 'http://return.url',
  base_url: 'https://openapi.alipaydev.com/gateway.do'
})

const bizContent = {
  subject: 'goods',
  out_trade_no: 'xxx',
  total_amount: '1.00',
  product_code: 'QUICK_MSECURITY_PAY'
}

describe('Alipay', function () {
  describe('#constructor', function () {
    it('appId is required', function () {
      try {
        new Alipay({}) // eslint-disable-line
      } catch (err) {
        assert.equal(err.code, 'ERR_ASSERTION')
      }
    })
  })

  describe('#formatter', function () {
    it('should get the exact sign string', function () {
      const formattedParams = 'out_trade_no=xxx&product_code=QUICK_MSECURITY_PAY&subject=goods&total_amount=1.00'
      assert.equal(Alipay.formatter(bizContent), formattedParams)
    })
  })

  describe('#get wap page url', function (done) {
    it('should get the exact url', function () {
      const url = alipay.getWapPageURL(bizContent)
      console.log('url:', url)
      assert.equal(url, url)
    })
  })
})
