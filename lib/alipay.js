'use strict'

const crypto = require('crypto')
const qs = require('querystring')
const assert = require('assert')
const axios = require('axios')
const moment = require('moment')
const { omit } = require('lodash')

const SIGN_TYPE = {
  RSA1: 'RSA-SHA1',
  RSA2: 'RSA-SHA256'
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

    if (cache[opts.app_id]) return cache[opts.app_id]
    this.appId = opts.app_id
    this.appPrivateKey = opts.app_private_key
    this.alipayPublicKey = opts.alipay_public_key
    this.signType = 'sign_type' in opts ? opts.sign_type : 'RSA2'
    this.notifyURL = opts.notify_url
    this.returnURL = opts.return_url
    this.baseURL = 'base_url' in opts ? opts.base_url : BASE_URL
    this.rsaFormatter()
    if ('cache' in opts && opts.cache) cache[opts.app_id] = this
  }

  /**
   * 格式化证书
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
   * 梳理执行参数
   * @param method 接口方法名
   * @param bizContent 业务参数
   * @param publicParam 公共请求参数
   * @return Object
   */
  paramsComb (method, bizContent, publicParam) {
    const params = Object.assign(PUBLIC_PARAMS, {
      biz_content: bizContent,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      method,
      app_id: this.appId,
      sign_type: this.signType
    }, publicParam)
    switch (method) {
      case 'alipay.trade.refund':
        break
      case 'alipay.trade.app.pay':
        params.notify_url = publicParam.notify_url || this.notifyURL
        break
      case 'alipay.trade.wap.pay':
        params.notify_url = publicParam.notify_url || this.notifyURL
        if (this.returnURL || publicParam.return_url) params.return_url = publicParam.return_url || this.returnURL
        break
    }

    return {
      params,
      sign: this.rsaSign(params)
    }
  }

  /**
   * 筛选、排序、拼接请求参数
   * @param params {JSON}
   * @param encode {Boolean} 是否对value进行encode  app支付需要encode
   * @return 待签名字符串
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
   * 生成签名
   * @param params {JSON} 待签参数
   * @return signed string
   */
  rsaSign (params) {
    return crypto
      .createSign(SIGN_TYPE[params.sign_type])
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
    return crypto
      .createVerify(SIGN_TYPE[signMap.sign_type])
      .update(Alipay.formatter(params))
      .verify(this.alipayPublicKey, signMap.sign, 'base64')
  }

  /**
   * 获取APP支付订单信息, 可覆盖公共请求参数
   * @param bizContent {JSON} 业务请求参数的集合
   * @param publicParam {JSON} 公共请求参数
   * @return String
   */
  getOrderInfoStr (bizContent, publicParam = {}) {
    const { params, sign } = this.paramsComb('alipay.trade.app.pay', bizContent, publicParam)
    return `${Alipay.formatter(params, true)}&sign=${encodeURIComponent(sign)}`
  }

  /**
   * 获取手机网站支付url, 可覆盖公共请求参数
   * @param bizContent {JSON} 业务请求参数的集合
   * @param publicParam { JSON } 公共请求参数
   * @return String
   */
  getWapPageURL (bizContent, publicParam = {}) {
    const { params, sign } = this.paramsComb('alipay.trade.wap.pay', bizContent, publicParam)
    return `${this.baseURL}?${Alipay.formatter(params)}&sign=${encodeURIComponent(sign)}`
  }

  /**
   * 统一收单交易退款接口
   * @param bizContent {JSON} 业务请求参数的集合
   * @param cb callback
   * @return {Promise}
   */
  refund (bizContent, cb = noop) {
    const { params, sign } = this.paramsComb('alipay.trade.refund', bizContent)
    params.sign = sign

    return axios
      .get(this.baseURL, { params })
      .then(response => {
        const refundResponse = response.data.alipay_trade_refund_response

        if (refundResponse.sub_msg) {
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
