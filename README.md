# alipay-sdk-node
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![Build Status][travis-image]][travis-url]
[![JavaScript Style Guide][style-image]][style-url]

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
  const alipay = new Alipay({
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

### WAP pay [click](https://docs.open.alipay.com/203/107090/)
* `#getWapPageUrl(bizContent[,publicParams])`: get the url of wap pay
* params: bizContent { JSON: required }
* params: publicParams { JSON: optional }, override the public params
* return: String

e.g.
```js
  alipay.getWapPageURL({
    subject: 'xxx',
    out_trade_no: 'xxx',
    total_amount: 'xxx',
    product_code: 'xxx'
  }, { return_url: 'http://xxx.com/orders/result/{id}' })
```

### APP Pay [click](https://docs.open.alipay.com/204/105465/)
* `#getOrderInfoStr(bizContent[,publicParams])`: get the string of order info
* params: bizContent {JSON: required}
* params: publicParams { JSON: optional }, override the public params
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

### Check sign [click](https://docs.open.alipay.com/204/105301/)
* `#rsaCheck(options)`: check sign
* params: request body {JSON}
* return: Boolean

e.g.
```js
  alipay.rsaCheck(request.body)
```

### Refund  [click](https://docs.open.alipay.com/api_1/alipay.trade.refund)
* `#refund(bizContent[,callback])`: refund api
* params: bizContent {JSON}
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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/yolopunk"><img src="https://avatars2.githubusercontent.com/u/7477825?v=4" width="100px;" alt=""/><br /><sub><b>Aaron Che</b></sub></a><br /><a href="https://github.com/yolopunk/alipay-sdk-node/commits?author=yolopunk" title="Code">💻</a> <a href="https://github.com/yolopunk/alipay-sdk-node/issues?q=author%3Ayolopunk" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
