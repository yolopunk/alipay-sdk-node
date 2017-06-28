'use strict'

const Alipay = require('../index')
const alipay = new Alipay({
  app_id: 'appId',
  app_public_key: 'appPublicKey',
  app_private_key: 'appPrivateKey',
  alipay_public_key: 'alipayPublicKey'
})

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
      const orderStr = alipay.getOrderInfoStr(params)
      console.log(orderStr)
      done()
    })
  })
})
