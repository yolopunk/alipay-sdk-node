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
   * @param app_private_key 应用私钥
   * @param alipay_public_key 支付宝公钥
   * @param sign_type 签名算法类型 默认 RSA2
   * @param notify_url app支付通知地址 optional
   * @param cache 是否将实例缓存下来
   * @return {*}
   */
  constructor (opts) {
    assert(opts.app_id, 'appid is required')

    if (cache[opts['app_id']]) return cache[opts['app_id']]
    this.appId = opts.app_id
    this.appPrivateKey = opts.app_private_key
    this.alipayPublicKey = opts.alipay_public_key
    this.signType = 'sign_type' in opts ? opts.sign_type : 'RSA2'
    this.notifyURL = opts.notify_url
    this.rsaFormatter()
    if ('cache' in opts && opts.cache) cache[opts['app_id']] = this
  }

  /**
   * 格式化
   */
  rsaFormatter () {
    if (this.alipayPublicKey.indexOf('BEGIN') === -1) {
      this.alipayPublicKey = `-----BEGIN PUBLIC KEY-----\n${this.alipayPublicKey}\n-----END PUBLIC KEY-----`
    }
    if (this.appPrivateKey.indexOf('BEGIN') === -1) {
      this.appPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${this.appPrivateKey}\n-----END RSA PRIVATE KEY-----`
    }
  }

  /**
   * 筛选、排序、拼接请求参数
   * @param params {JSON}
   * @param encode {Boolean} 是否对value进行encode
   */
  static formatter (params, encode = false) {
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
      .update(Alipay.formatter(params))
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
      .update(Alipay.formatter(params))
      .verify(this.alipayPublicKey, sign, 'base64')
  }

  /**
   * 获取APP支付订单信息
   * @param bizContent {JSON} 业务请求参数的集合
   * @return String
   */
  getOrderInfoStr (method = 'alipay.trade.app.pay', bizContent) {
    const params = Object.assign({
      biz_content: bizContent,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      method,
      app_id: this.appId,
      notify_url: this.notifyURL,
      sign_type: this.signType
    }, PUBLIC_PARAMS)

    params.sign = this.rsaSign(params)

    const { sign } = params
    const toEncodeParams = omit(params, ['sign'])
    return `${Alipay.formatter(toEncodeParams, true)}&sign=${encodeURIComponent(sign)}`
  }

  /**
   * 手机网站返回HTML代码片段
   * @param bizContent {JSON} 业务请求参数的集合
   * @return text/html
   */
  getWapPage (bizContent, cb = noop) {
    const qs = this.getOrderInfoStr('alipay.trade.wap.pay', bizContent)
    return axios
      .get(BASE_URL + '?' + qs)
      .then(response => {
        cb(null, response)
        return Promise.resolve(response)
      })
      .catch(err => {
        cb(err)
        return Promise.reject(err)
      })
  }
  /**
   * 统一收单交易退款接口
   * @param bizContent {JSON} 业务请求参数的集合
   * @param cb callback
   * @return {Promise}
   */
  refund (bizContent, cb = noop) {
    const params = Object.assign({
      biz_content: bizContent,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      method: 'alipay.trade.refund',
      app_id: this.appId,
      sign_type: this.signType
    }, PUBLIC_PARAMS)
    params.sign = this.rsaSign(params)

    return axios
      .get(BASE_URL, { params })
      .then(response => {
        const refundResponse = response['data']['alipay_trade_refund_response']

        if (refundResponse['sub_msg']) {
          cb(refundResponse)
          return Promise.reject(refundResponse)
        }
        cb(null, refundResponse)
        return Promise.resolve(refundResponse)
      })
      .catch(err => {
        cb(err)
        return Promise.reject(err)
      })
  }
}

function noop () {
  return false
}

module.exports = Alipay
