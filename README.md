# alipay-sdk-node

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


---
## Install

```bash
 $ npm install alipay-sdk-node --save
```
---

## Usage

### Create Alipay Instance

```js
  const Alipay = require('alipay-sdk-node')
  const alipay = new Aliapy({
    app_id,
    app_public_key,
    app_private_key,
    alipay_public_key,
    sign_type = 'RSA2',
    notify_url
  })
```

### APP Pay
* get the string of order info
* params: biz_content {JSON} [click](https://docs.open.alipay.com/204/105465/)
```js
  alipay.getOrderInfoStr({
    subject: 'xxx',
    out_trade_no: 'xxx',
    total_amount: 'xxx',
    product_code: 'xxx'
  })
```

### Check sign
* params: request body {JSON} [click](https://docs.open.alipay.com/204/105301/)
* return: Boolean
```js
  alipay.rsaCheck(request.body)
```

### Refund
* params: biz_content {JSON} [click](https://docs.open.alipay.com/api_1/alipay.trade.refund)
* return: Promise Or Callback
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
