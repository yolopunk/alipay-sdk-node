/* eslint-env mocha */

'use strict'

const assert = require('assert')
const Alipay = require('../index')

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
const formattedParams = 'app_id=2016080700188285&biz_content={"subject":"goods","out_trade_no":"xxx","total_amount":"1.00","product_code":"QUICK_MSECURITY_PAY"}&charset=utf-8&method=alipay.trade.app.pay&sign=e9zEAe4TTQ4LPLQvETPoLGXTiURcxiAKfMVQ6Hrrsx2hmyIEGvSfAQzbLxHrhyZ48wOJXTsD4FPnt+YGdK57+fP1BCbf9rIVycfjhYCqlFhbTu9pFnZgT55W+xbAFb9y7vL0MyAxwXUXvZtQVqEwW7pURtKilbcBTEW7TAxzgro=&sign_type=RSA2&timestamp=2014-07-24 03: 07: 50&version=1.0'

describe('Alipay', function () {
  describe('#constructor', function () {
    it('appId is required', function () {
      try {
        const alipay = new Alipay({})
        console.log(alipay)
      } catch (err) {
        assert.equal(err.code, 'ERR_ASSERTION')
      }
    })
  })

  describe('#formatter', function () {
    it('should get the exact sign string', function () {
      assert.equal(Alipay.formatter(params), formattedParams)
    })
  })
})
