'use strict'

const crypto = require('crypto')
const qs = require('querystring')
const assert = require('assert')
const { omit, pick } = require('lodash')

const SIGN_TYPE = {
  'RSA1': 'RSA-SHA1',
  'RSA2': 'RSA-SHA256'
}

const cache = {}

class Alipay {
  constructor ({app_id, app_public_key, app_private_key, alipay_public_key}) {
    assert(app_id, 'appid is required')

    if (cache[app_id]) return cache[app_id]
    this.appId = app_id
    this.appPublicKey = app_public_key
    this.appPrivateKey = app_private_key
    this.alipayPublicKey = alipay_public_key
    this.rsaFormatter()
    cache[app_id] = this
  }

  /**
   * 格式化
   */
  rsaFormatter () {
    if (this.alipayPublicKey.indexOf('BEGIN PUBLIC KEY') === -1) {
      this.alipayPublicKey = "-----BEGIN PUBLIC KEY-----\n" + this.alipayPublicKey
        + "\n-----END PUBLIC KEY-----"
    }
  }

  /**
   * 筛选、排序、拼接请求参数
   * @param params {JSON}
   * @param encode {Boolean} 是否对value进行encode
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
   * @param signMap {JSON} 被验证签名obj
   * @return {Boolean}
   */
  rsaCheck (signMap) {
    const params = omit(signMap, ['sign', 'sign_type'])
    const { sign, sign_type } = pick(signMap, ['sign', 'sign_type'])
    return crypto
      .createVerify(SIGN_TYPE[sign_type])
      .update(this.formatter(params))
      .verify(this.alipayPublicKey, sign, 'base64')
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

  refund (params) {

  }
}

module.exports = Alipay
