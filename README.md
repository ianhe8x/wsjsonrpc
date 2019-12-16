# wsjsonrpc
A jsonrpc client over websocket, supports promise and rxjs

# Supports
* jsonrpc v2.0
* browser and nodejs
* Promise/Rxjs client
* auto reconnect
# Usage
## Promise
```js
const {JsonRpcClient} = require('wsjsonrpc')
const client = new JsonRpcClient('ws://localhost:9944')
const result = await client.send('some method')
console.log('result', result)
client.destroy()
// or disconnect after send()
const result = await JsonRpcClient.with('ws://localhost:9944', client => {
  return client.send('some method')
})
```

## Rxjs
```js
const {JsonRpcRxClient} = require('wsjsonrpc')
const client = new JsonRpcRxClient('ws://localhost:9944')
client.send('some method').subscribe(result => {
    console.log('result', result)
    client.destroy()
})

```
