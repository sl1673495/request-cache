<h1 align="center">Welcome to request-cache 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/request-cache" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/request-cache.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

## Intro
本地缓存 fetch 请求的结果，基于你自己定义的生成 key 的策略（默认是使用 `url + stringify(body)`）来把结果保存到本地存储中，在接口请求比较缓慢的时候提效非常明显。

使用 [localforage](https://github.com/localForage/localForage) 这个库作为底层的存储，它默认采用 `IndexedDB` 进行本地存储。

## Install

```sh
npm install request-dev-cache -S
npm install localforage -S
```

## Usage

### Options

```ts
interface CacheFetchOptions {
  /**
   * 生成缓存key的策略，默认策略是直接拼接 url + stringify(body)
   */
  generateKey?: (url: RequestInfo, body: object) => string;
  /**
   * 传入 url 和 fetch 选项 判断是否需要缓存
   */
  shouldHandleRequest?(url: RequestInfo, requestInit?: RequestInit): boolean;
  /**
   * 传入 response 响应对象 判断是否需要缓存
   */
  shouldCacheResult?(response: Response): Promise<boolean>;
}
```

```js
import { startCache } from 'request-cache';
import { omit } from 'lodash'

startCache({
  generateKey(url, body) {
    // 可以排除掉一些你不想缓存的参数值
    return `${url}-${JSON.stringify(omit(body, ['key1', 'key2']))}`;
  },
  shouldHandleRequest(url: string) {
    // 可以规定 /api 开头的请求才缓存
    return url.startsWith('/api');
  },
  shouldCacheResult: async response => {
    // 过滤掉不想缓存的结果
    const result = await response.json();
    return (
      response.headers.get('content-type') === 'application/json' &&
      response.status === 200 &&
    );
  },
});
```

## Run tests

```sh
npm run test
```

## Author

👤 **ssh**

- Website: https://ssh-blog.now.sh
- Github: [@sl1673495](https://github.com/sl1673495)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
