# www.youware.com 项目清单加载机制调研备忘

## 背景
- 目标：解析首页「Trending Projects」的懒加载实现方式，并实现自动化拉取全部项目。
- 环境：Next.js App Router 前端，数据经由 RSC/Server Action 返回，主要接口 `getProjects`。

## 关键结构
- 滚动容器：`#page-scroll-div` (`div.relative.flex.h-screen...overflow-y-auto`) 负责承载内容并滚动。
- 哨兵节点：`div.absolute.bottom-250`（高度 4px，放在网格容器底部 250px 处）供 `IntersectionObserver` 监听。
- 数据源：客户端组件 `$` 首次渲染使用 `initialProjects`；追加页通过 `getProjects` 传入 `cursor`、`category_id` 等参数获取。

## 懒加载流程
1. IntersectionObserver 监听哨兵进入视口时触发 `V()` → `M(false, category)`。
2. `M` 调用 `getProjects`（Server Action ID `60d18ff2…`），返回 `projects` 与 `page_info.has_more / next_cursor`。
3. 新列表去重后 append；若还有 `has_more`，继续等待下一次交叉事件。
4. 哨兵默认位于视口下方 250px，单纯滚到最底部不足以再次触发；必须让哨兵离开视口后再进入（人工操作表现为“到底 → 上拉一点 → 再到底”）。

## 常见现象
- 控制台中大量 `POST / (text/x-component)` 为 RSC 请求，说明分页非传统 REST。
- Lottie emoji 的 CORS 报错与项目加载无关，可忽略。
- 触发频率过高时会报 “Something went wrong”，需点击重试按钮或调整等待时间。

## 自动化策略
```js
(async () => {
  const scroller = document.getElementById('page-scroll-div');
  const grid = document.querySelector('[data-project-grid]');
  if (!scroller || !grid) {
    console.error('找不到滚动容器或项目网格');
    return;
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  let lastCount = grid.children.length;
  let rounds = 0;

  while (rounds < 200) {
    rounds += 1;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'instant' });
    await wait(400);

    const sentinel = document.querySelector('div.absolute.bottom-250');
    if (!sentinel) {
      console.warn('找不到哨兵节点，提前结束');
      break;
    }
    sentinel.scrollIntoView({ block: 'center', behavior: 'instant' });
    await wait(300);

    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'instant' });
    await wait(1200);

    const current = grid.children.length;
    console.log(`第 ${rounds} 轮 → ${current} 项`);

    if (current <= lastCount) {
      await wait(1000);
      const recheck = grid.children.length;
      if (recheck <= lastCount) {
        console.log(`结束：共加载 ${lastCount} 项（rounds=${rounds}）`);
        break;
      }
      lastCount = recheck;
    } else {
      lastCount = current;
    }
  }
})();
```
- 核心手法：通过 `scrollIntoView({ block: 'center' })` 人造“上拉”动作，确保哨兵离开/进入视口。
- 根据网络状况可放大等待时长；若出现错误提示需人工重试后再执行脚本。

## 经验沉淀
- App Router + RSC 环境里，分页逻辑可能隐藏在客户端组件，需查看 `_next/static/chunks/*.js` 定位；`createServerReference` 提示真实 server action 名称。
- 遇到懒加载失效时要检查滚动容器，而非 `window`；特别注意 `overflow-y-auto` 的内层元素。
- IntersectionObserver 结合 `bottom:Npx` 的布局，可能需要“往回滚”才能触发下一次 fetch，脚本应模拟这一动作。
- 控制台钩住 `fetch` 方便确认数据来源，配合 `scrollIntoView` 可以快速验证触发条件。

## 后续建议
1. 如需稳定爬取，可将脚本改为 Puppeteer/Playwright 版本，自动等待 `grid.children.length` 增长。
2. 若要分类爬取，追加参数 `category_id` 并模拟点击分类按钮 (`home_category_tab_click`)。
3. 若担心请求节奏触发限流，增大循环间隔并检测 `page_info.has_more` 以避免无效请求。
