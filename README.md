# alipay-sdk-node

[![JavaScript Style Guide][style-image]][style-url]
[![Build Status][travis-image]][travis-url]
[![npm download][download-image]][download-url]

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
[travis-image]: https://travis-ci.org/yolopunk/alipay-sdk-node.svg?branch=master
[travis-url]: https://travis-ci.org/yolopunk/alipay-sdk-node
[download-image]: https://img.shields.io/npm/dm/alipay-sdk-node.svg?style=flat-square
[download-url]: https://npmjs.org/package/alipay-sdk-node

---
## Install

```bash
 $ npm install alipay-sdk-node --save
```
---

## Usage

### Create Alipay Instance

e.g.
```js
  const Alipay = require('alipay-sdk-node')

  /**
   *  @param app_id required
   *  @param app_private_key required
   *  @param alipay_public_key required
   *  @param notify_url required
   *  @param return_url optional, for wap pay
   *  @param sign_type optional, default is RSA2
   *  @param base_url optional, default is 'https://openapi.alipay.com/gateway.do'
   *  @param cache optional, whether cache the alipay instance or not
   * /
  const alipay = new Aliapy({
    app_id: 'xxx',
    app_private_key: fs.readFileSync('filePath'),
    alipay_public_key: fs.readFileSync('filePath'),
    notify_url: 'xxx',
    sign_type: 'RSA2',
    base_url: 'https://openapi.alipaydev.com/gateway.do',
    return_url: 'xxx',
    cache: false
  })
```

### WAP pay
* `#getWapPageUrl(biz_content)`: get the url of wap pay
* params: biz_content { JSON } [click](https://docs.open.alipay.com/203/107090/)
* return: String

e.g.
```js
  alipay.getWapPageUrl({
    subject: 'xxx',
    out_trade_no: 'xxx',
    total_amount: 'xxx',
    product_code: 'xxx'
  })
```

### APP Pay
* `#getOrderInfoStr(biz_content)`: get the string of order info
* params: biz_content {JSON} [click](https://docs.open.alipay.com/204/105465/)
* return: String

e.g.
```js
  alipay.getOrderInfoStr({
    subject: 'xxx',
    out_trade_no: 'xxx',
    total_amount: 'xxx',
    product_code: 'xxx'
  })
```

### Check sign
* `#rsaCheck(options)`: check sign
* params: request body {JSON} [click](https://docs.open.alipay.com/204/105301/)
* return: Boolean

e.g.
```js
  alipay.rsaCheck(request.body)
```

### Refund
* `#refund(biz_content[,callback])`: refund api
* params: biz_content {JSON} [click](https://docs.open.alipay.com/api_1/alipay.trade.refund)
* return: Promise Or Callback

e.g.
```js
  alipay.refund({
    out_trade_no: 'xxx',
    trade_no: 'xxx',
    refund_amount: 'xxx',
    out_request_no: 'xxx',
    refund_reason: 'xxx'
  })
```
---
