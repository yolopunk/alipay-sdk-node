'use strict'

const crypto = require('crypto')
const qs = require('querystring')
const { omit, pick } = require('lodash')

const SIGN_TYPE = {
  'RSA1': 'RSA-SHA1',
  'RSA2': 'RSA-SHA256'
}

class Alipay {
  constructor ({app_id, app_public_key, app_private_key, alipay_public_key}) {
    this.appId = app_id
    this.appPublicKey = app_public_key
    this.appPrivateKey = app_private_key
    this.alipayPublicKey = alipay_public_key
  }

  /**
   * 筛选、排序、拼接请求参数
   * @param params {obj}
   * @param encode {boolean} 是否对value进行encode
   */
  formatter (params, encode = false) {
    const sortedParams = {}
    Object.keys(params).sort().map(key => {
      if (typeof params[key] === 'object') {
        params[key] = JSON.stringify(params[key])
      }

      sortedParams[key] = encode
        ? encodeURIComponent(params[key])
        : params[key]
    })

    return qs.unescape(qs.stringify(sortedParams))
  }

  /**
   * 筛选、排序、拼接请求参数并生成签名
   * @param params {JSON} 待签参数
   * @return signed string
   */
  rsaSign (params) {
    return crypto
      .createSign(SIGN_TYPE[params['sign_type']])
      .update(this.formatter(params))
      .sign(this.appPrivateKey, 'base64')
  }

  /**
   * 验签
   * @param signMap {json} 被验证签名obj
   * @return {Boolean}
   */
  rsaCheck (signMap) {
    const params = omit(signMap, ['sign', 'sign_type'])
    const { sign, sign_type } = pick(signMap, ['sign', 'sign_type'])
    return crypto
      .createVerify(SIGN_TYPE[sign_type])
      .update(qs.unescape(qs.stringify(params)))
      .verify(this.alipayPublicKey, sign)
  }

  /**
   * 获取APP支付订单信息
   * @param params {JSON} 请求参数
   * @return String
   */
  getOrderInfoStr (params) {
    const { sign } = params
    const toEncodeParams = omit(params, ['sign'])
    return `${this.formatter(toEncodeParams, true)}&sign=${encodeURIComponent(sign)}`
  }
}

module.exports = Alipay
