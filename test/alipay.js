'use strict'

const Alipay = require('../index')
const alipay = new Alipay({
  app_id: '2016080700188285',
  app_public_key: 'appPublicKey',
  app_private_key: `-----BEGIN RSA PRIVATE KEY-----\n${Buffer.from('appPrivateKey', 'ascii').toString('base64')}\n-----END RSA PRIVATE KEY-----`,
  alipay_public_key: 'alipayPublicKey'
})

console.log(alipay)

const params = {
  app_id: '2016080700188285',
  method: 'alipay.trade.app.pay',
  charset: 'utf-8',
  sign_type: 'RSA2',
  timestamp: '2014-07-24 03: 07: 50',
  biz_content: {
    subject: 'goods',
    out_trade_no: 'xxx',
    total_amount: '1.00',
    product_code: 'QUICK_MSECURITY_PAY'
  },
  version: '1.0',
  sign: 'e9zEAe4TTQ4LPLQvETPoLGXTiURcxiAKfMVQ6Hrrsx2hmyIEGvSfAQzbLxHrhyZ48wOJXTsD4FPnt+YGdK57+fP1BCbf9rIVycfjhYCqlFhbTu9pFnZgT55W+xbAFb9y7vL0MyAxwXUXvZtQVqEwW7pURtKilbcBTEW7TAxzgro='
}

describe('Alipay', function () {
  describe('#formatter', function () {
    it('should get the exact sign string', function (done) {
      const signStr = alipay.formatter(params)
      console.log(signStr)
      done()
    })
  })

  describe('#getOrderInfoStr', function () {
    it('should get the exact order info for app pay', function (done) {
      const orderStr = alipay.getOrderInfoStr({
        subject: 'goods',
        out_trade_no: 'xxx',
        total_amount: '1.00',
        product_code: 'QUICK_MSECURITY_PAY'
      })
      console.log(orderStr)
      done()
    })
  })
})
