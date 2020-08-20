import localforage from "localforage";

export interface CacheFetchOptions {
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

const STORAGE_PREFIX = "request-dev-cache:";

export const startCache = ({
  generateKey = defaultGenerateKey,
  shouldHandleRequest = () => true,
  shouldCacheResult = async () => true,
}: CacheFetchOptions) => {
  const parseBody = (options?: RequestInit) => {
    let { body: rawBody } = options ?? {};
    let body: object;
    if (typeof rawBody === "string") {
      body = JSON.parse(rawBody as string) ?? {};
    } else {
      body = {};
    }
    return body;
  };

  const originFetch = window.fetch;
  window.fetch = async (...params) => {
    const [url, options] = params;
    if (!shouldHandleRequest?.(url, options)) {
      return originFetch(...params);
    }
    const body = parseBody(options);
    const cacheKey = `${STORAGE_PREFIX}${generateKey(url, body)}`;
    const cacheResult: object | null = await localforage.getItem(cacheKey);
    if (cacheResult) {
      log(url, body, cacheResult);
      return new Response(JSON.stringify(cacheResult));
    } else {
      const resp = await originFetch(...params);
      const responseForFilter = resp.clone();
      if (await shouldCacheResult(responseForFilter)) {
        const responseForStorage = resp.clone();
        const result = await responseForStorage.json();
        await localforage.setItem(cacheKey, result);
      }
      return resp;
    }
  };

  /**
   * 清除所有缓存
   */
  (window as any).cleanAllRequestDevCaches = async () => {
    const targetKeys: string[] = [];
    const keys = await localforage.keys();

    keys.forEach((key) => {
      if (key?.startsWith(STORAGE_PREFIX)) {
        targetKeys.push(key);
      }
    });
    targetKeys.forEach((key) => {
      localforage.removeItem(key);
    });
  };

  /**
   * 根据 url 模糊匹配清除缓存
   */
  (window as any).cleanRequestDevCache = async (url: string) => {
    const keys = await localforage.keys();
    keys.forEach((key) => {
      if (key?.includes(`${STORAGE_PREFIX}${url}`)) {
        localforage.removeItem(key);
      }
    });
  };
};

function log(url: RequestInfo, body: object, result: object) {
  console.groupCollapsed(`接口缓存读取成功 ${url}`);
  console.log("%c 接口参数", "color: #03A9F4; font-weight: bold", body);
  console.log("%c 缓存结果", "color: #4CAF50; font-weight: bold", result);
  console.groupEnd();
}

function defaultGenerateKey(url: RequestInfo, body: object) {
  return `${url}-${JSON.stringify(body as object)}`;
}
