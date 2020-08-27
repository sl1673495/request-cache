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
