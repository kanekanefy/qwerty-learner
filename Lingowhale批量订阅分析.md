# Lingowhale 批量订阅接口调研备忘

## 页面结构与脚本加载
- 入口：`https://lingowhale.com/home`，Next.js App Router，关键脚本位于 `_next/static/chunks/app/(dashboard)/home/page-*.js`。
- 通过 `webpackChunk_N_E.push` 注入临时 chunk，可获取模块 `76884` 中导出的 API 包装函数。
- 主要函数列表（全部走同一个请求工具 `i()`，基础地址 `https://api-public.lingowhale.com`）：
  - `Dl` → `POST /api/feed/v1/user_subscribe/list`
  - `U9`/`tF`/`_T` → `POST /api/feed/v1/user_subscribe/upsert`
  - `Dk` → `POST /api/feed/v1/user_subscribe/batch_upsert`
  - `xY` → `POST /api/feed/v1/user_subscribe/delete`
  - `KB` → `POST /api/feed/v1/subscription_channel/search`
  - `sS`/`iE`/`_O` → 专题分组相关接口
  - 其余函数对应行为埋点、配置、文件上传等。

## 鉴权与请求头
登录后浏览器 `localStorage` 持久化以下字段，所有接口共用：
- `Extension-AccessToken`
- `Extension-AuthToken`
- `Extension-UID`
- `Extension-Guest-Id`
- `Extension-BID`
- 需额外携带 `web-site: lingowhale`、`trace-id`

示例（浏览器控制台内执行）：
```js
const headers = {
  'content-type': 'application/json',
  'access-token': localStorage.getItem('Extension-AccessToken') ?? '',
  'auth-token': localStorage.getItem('Extension-AuthToken') ?? '',
  'u-id': localStorage.getItem('Extension-UID') ?? '',
  'guest-id': localStorage.getItem('Extension-Guest-Id') ?? '',
  'b-id': localStorage.getItem('Extension-BID') ?? '',
  'web-site': 'lingowhale',
  'trace-id': 'batch-test'
}
```
> 注意：直连 `https://api.lingowhale.com` 多数返回 404，需使用 `https://api-public.lingowhale.com`。

## 关键接口调试
### 1. 查询订阅信息
```js
fetch('https://api-public.lingowhale.com/api/feed/v1/user_subscribe/list', {
  method: 'POST', headers,
  body: JSON.stringify({ cursor: '', limit: 50 })
}).then(r => r.json())
```
返回 `user_subscribes`，包含所有频道、自建专题、分组及其 `channel_id`、`info_sources` 等完整结构，可直接复用作导出来源。

### 2. 批量新增订阅
`/api/feed/v1/user_subscribe/batch_upsert`
- 请求体参数：
  - `channel_ids`: 数组（可以传已有频道 ID，或为空数组用于“快速订阅”）
  - `info_source_list`: `{ info_source_id, info_source_type }[]`
- 示例：
```js
fetch('https://api-public.lingowhale.com/api/feed/v1/user_subscribe/batch_upsert', {
  method: 'POST', headers,
  body: JSON.stringify({
    channel_ids: [],
    info_source_list: [
      { info_source_id: '66cdd7895430887553f15c2d', info_source_type: 1 }
    ]
  })
}).then(r => r.json())
```
成功响应：`{ code:0, data: { channel_2_subscribe_id: { ... }}}`

### 3. 单个频道新增/编辑
`/api/feed/v1/user_subscribe/upsert`
- 需提供 `subscription` 对象：
```json
{
  "subscription": {
    "subscription_id": "可留空新建",
    "name": "批量订阅测试",
    "info_sources": [ { "info_source_type":1, "info_source_id":"xxx" } ]
  }
}
```
- 若直接调用 `api.lingowhale.com` 会 404，必须走公网域名。
- 删除接口 `/api/feed/v1/user_subscribe/delete`，参数 `{ subscription_id }`。

## 自动化批量订阅方案建议
1. **获取目标源列表**：
   - 使用 `/subscription_channel/search` (`KB`) 按关键字或类别分页搜索；
   - 或通过 `user_subscribe/list` 读取已有频道进行二次分发。
2. **调用顺序**：
   - 根据实际需求选择 `batch_upsert`（一次多个 info source）或 `upsert` 创建自定义频道；
   - 发起请求前确保 token 最新，可从登录回调或 `localStorage` 读取。
3. **节流与错误处理**：
   - 接口未见严格限流，但建议控制在每秒 2~3 次，检查 `code`、`msg`；
   - 如返回字段缺失（例如漏填 `channel_ids`），会直接报错。
4. **外部实现方式**：
   - 浏览器控制台脚本：适合一次性导入；
   - Node.js/Playwright：可复用上述 headers，实现自动登录后批量调用。

## 复现步骤速查
1. 打开控制台 `Application → Local Storage` 复制令牌。
2. 在 `Console` 粘贴示例 fetch，验证 `user_subscribe/list` 正常返回。
3. 根据需求构造 `info_source_list`，调用 `user_subscribe/batch_upsert`。
4. 刷新页面，在「订阅」页确认新源已出现。

## 2025-02 批量导入实战记录
- 任务：尝试把 `需要订阅.md` 前 10 个账号批量加入频道「AAA我的公众号订阅」。
- 现状：目标频道已包含「阿尔法工场研究院 / AgeClub / AGI人工智能 / AI大航海」4 个目标账号；`subscription_channel/search` 能检索到「Aging」「爱范儿」「爱分析ifenxi」，其余「Aha 车库」「AHTE」「AI 的潜意识」暂无搜索结果。
- 操作：通过 `webpackChunk_N_E.push` 注入模块 76884，直接复用前端封装的 `Dk`(batch_upsert)、`U9`(upsert)、`mi`(subscription_channel/upsert) 等函数；多次传入 `channel_id = 687a498a6b21fcb24ff1716c`、`subscription_id = 687a498a6b21fcb24ff1716d` 与目标 `info_sources` 组合，请求均返回 `code:0`。
- 结果：接口响应成功但频道列表始终维持 25 个既有源，新增账号未出现，推测需要额外字段（如 `subscribe_id`、排序配置）或频道存在后端条目上限，简单 upsert 不会生效。
- 建议：后续可先在 UI 中手动添加单个公众号，抓取 Network payload 对比差异；若频道有配额限制，需先删除冗余源再写入目标账号。

## 后续拓展
- `user_subscribe/list` 返回的数据结构可直接存档，作为批量迁移或备份；
- 通过 `subscription_channel/upsert`、`subscription_group/upsert` 等，可以实现自定义频道/分组的完整复制；
- 若需要从第三方 CSV 导入，可在脚本内转换为 `info_source_list` 再批量推送。
