'use strict'

const crypto = require('crypto')
const qs = require('querystring')
const assert = require('assert')
const axios = require('axios')
const moment = require('moment')
const { omit, pick } = require('lodash')

const SIGN_TYPE = {
  'RSA1': 'RSA-SHA1',
  'RSA2': 'RSA-SHA256'
}

const BASE_URL = 'https://openapi.alipay.com/gateway.do'
const PUBLIC_PARAMS = {
  format: 'JSON',
  charset: 'utf-8',
  version: '1.0'
}

const cache = {}

class Alipay {
  /**
   * Alipay
   * @param app_id 支付宝分配给开发者的应用ID
   * @param app_public_key 应用公钥
   * @param app_private_key 应用私钥
   * @param alipay_public_key 支付宝公钥
   * @param sign_type 签名算法类型 默认 RSA2
   * @param notify_url app支付通知地址 optional
   * @return {*}
   */
  constructor ({app_id, app_public_key, app_private_key, alipay_public_key, sign_type = 'RSA2', notify_url}) {
    assert(app_id, 'appid is required')

    if (cache[app_id]) return cache[app_id]
    this.appId = app_id
    this.appPublicKey = app_public_key
    this.appPrivateKey = app_private_key
    this.alipayPublicKey = alipay_public_key
    this.signType = sign_type
    this.notifyURL = notify_url
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
   * @param bizContent {JSON} 业务请求参数的集合
   * @return String
   */
  getOrderInfoStr (bizContent) {
    const params = {
      biz_content: bizContent,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      method: 'alipay.trade.app.pay',
      app_id: this.appId,
      notify_url: this.notifyURL,
      sign_type: this.signType
    }
    params.sign = this.rsaSign(Object.assign({}, PUBLIC_PARAMS, params))

    const { sign } = params
    const toEncodeParams = omit(params, ['sign'])
    return `${this.formatter(toEncodeParams, true)}&sign=${encodeURIComponent(sign)}`
  }

  /**
   * 统一收单交易退款接口
   * @param bizContent {JSON} 业务请求参数的集合
   * @param cb callback
   */
  refund (bizContent, cb = noop) {
    const params = {
      biz_content: bizContent,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      method: 'alipay.trade.refund',
      app_id: this.appId,
      sign_type: this.signType
    }
    params.sign = this.rsaSign(Object.assign({}, PUBLIC_PARAMS, params))

    return axios
      .get(BASE_URL, { params: Object.assign({}, PUBLIC_PARAMS, params) })
      .then(response => {
        const refundResponse = response['data']['alipay_trade_refund_response']

        if (refundResponse['sub_msg']) {
          cb(refundResponse)
          return Promise.reject(refundResponse)
        }
        Promise.resolve(refundResponse)
        cb(null, refundResponse)
      })
      .catch(Promise.reject)
  }
}

function noop() {
  return false
}

module.exports = Alipay
