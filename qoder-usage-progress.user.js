// ==UserScript==
// @name         Qoder Usage Planned Progress
// @namespace    https://github.com/nianjiang
// @version      0.1.0
// @description  在 Qoder Usage 页面"实际用量"下方显示当月规划进度 + 通过官方 API 拉取每日实际用量
// @author       https://github.com/nianjiang
// @match        https://qoder.com/account/usage*
// @grant        none
// @run-at       document-end
// @license      Apache 2.0
// ==/UserScript==

(function () {
    'use strict';

    // 每月 Credits 总量，按自己的订阅修改
    const MONTHLY_TOTAL = 3000;

    // ========== 1. 规划进度 ==========
    function getPlanned() {
        const now = new Date();
        const day = now.getDate();
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const pct = (day / days) * 100;
        return { day, days, pct, amount: (MONTHLY_TOTAL * pct) / 100 };
    }

    // ========== 2. 调用同域 API 拉取本月用量记录 ==========
    // GET /api/v1/me/usages/big_model_credits/histories（同域请求自动携带登录 cookie）
    async function fetchDailyUsage() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

        const records = [];
        for (let page = 1; page <= 50; page++) {
            const url = `/api/v1/me/usages/big_model_credits/histories`
                + `?page=${page}&page_size=100`
                + `&start_time=${start}&end_time=${end}`
                + `&order_by=begin_at&order=-1`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`API 返回 ${resp.status}`);
            const json = await resp.json();
            if (page === 1) console.log('[Qoder Progress] API 首页响应:', json);

            const arr = extractArray(json);
            if (!arr || arr.length === 0) break;
            records.push(...arr);
            if (arr.length < 100) break; // 不满一页，没有更多数据
        }
        console.log('[Qoder Progress] 共拉取用量记录:', records.length, '条');
        return records;
    }

    // 从响应中定位记录数组（兼容 items/usages/list/data 等常见字段名及顶层数组）
    function extractArray(json) {
        if (Array.isArray(json)) return json;
        if (!json || typeof json !== 'object') return null;
        for (const k of ['items', 'usages', 'list', 'data', 'histories', 'records', 'results']) {
            if (Array.isArray(json[k])) return json[k];
        }
        for (const v of Object.values(json)) {
            if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') return v;
        }
        return null;
    }

    // ========== 3. 按天聚合（1 号到今天，缺失补 0）==========
    const TIME_KEY = /^(begin_at|beginAt|timestamp|created_at|createdAt|date|time)$/i;
    const NUM_KEY = /^(credits?|cost|used_value|usedValue|amount|consumed)$/i;

    function parseDay(rec) {
        for (const k of Object.keys(rec)) {
            if (!TIME_KEY.test(k)) continue;
            const v = rec[k];
            let d = null;
            if (typeof v === 'number' && v > 1e12) d = new Date(v);
            else if (typeof v === 'string' && v.length >= 10) {
                const t = new Date(v);
                if (!isNaN(t)) d = t;
            }
            if (d) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        return null;
    }

    function pickAmount(rec) {
        for (const k of Object.keys(rec)) {
            if (NUM_KEY.test(k) && typeof rec[k] === 'number') return rec[k];
        }
        return null;
    }

    function aggregateDaily(records) {
        const daily = new Map();
        records.forEach(rec => {
            const day = parseDay(rec);
            const amt = pickAmount(rec);
            if (day && typeof amt === 'number') daily.set(day, (daily.get(day) || 0) + amt);
        });

        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;
        const rows = [];
        for (let d = 1; d <= now.getDate(); d++) {
            const date = prefix + String(d).padStart(2, '0');
            rows.push({ date, amount: daily.get(date) || 0 });
        }
        let cum = 0;
        rows.forEach(r => { cum += r.amount; r.cumulative = cum; });
        return rows;
    }

    // 渲染表格：日期 + 当日用量两列

    // ========== 4. UI ==========
    function buildPanel() {
        const p = getPlanned();

        const panel = document.createElement('div');
        panel.id = 'qoder-planned-progress';
        panel.style.cssText = [
            'margin: 16px 0', 'padding: 12px 16px',
            'border: 1px solid #e5e7eb', 'border-radius: 8px',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'font-size: 13px', 'color: #374151'
        ].join(';');

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:6px;';
        const title = document.createElement('span');
        title.textContent = '📅 规划进度（应该已用）';
        const value = document.createElement('span');
        value.textContent = `${p.pct.toFixed(1)}%（${p.amount.toFixed(0)} / ${MONTHLY_TOTAL}）`;
        header.append(title, value);

        const track = document.createElement('div');
        track.dataset.qTrack = '1'; // 标记，供对齐逻辑定位
        track.style.cssText = 'background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;';
        const bar = document.createElement('div');
        bar.style.cssText = [
            `width:${Math.min(p.pct, 100)}%`, 'height:100%',
            'background:linear-gradient(90deg,#f59e0b,#fbbf24)',
            'border-radius:4px', 'transition:width .3s ease'
        ].join(';');
        track.appendChild(bar);

        const foot = document.createElement('div');
        foot.style.cssText = 'margin-top:6px;display:flex;justify-content:space-between;align-items:center;';
        const footText = document.createElement('span');
        footText.style.cssText = 'font-size:12px;color:#6b7280;';
        footText.textContent = `本月第 ${p.day} 天 / 共 ${p.days} 天`;

        const btn = document.createElement('button');
        btn.textContent = '查看每日总量';
        btn.style.cssText = [
            'padding:4px 12px', 'font-size:12px',
            'border:1px solid #d1d5db', 'border-radius:4px',
            'background:white', 'color:#374151', 'cursor:pointer'
        ].join(';');
        btn.onmouseover = () => { btn.style.background = '#f9fafb'; };
        btn.onmouseout = () => { btn.style.background = 'white'; };
        btn.onclick = () => toggleDailyDetail(panel);

        foot.append(footText, btn);
        panel.append(header, track, foot);
        return panel;
    }

    function toggleDailyDetail(panel) {
        const existing = document.getElementById('qoder-daily-detail');
        if (existing) { existing.remove(); return; }

        const detail = document.createElement('div');
        detail.id = 'qoder-daily-detail';
        detail.style.cssText = 'margin-top:12px;padding:12px;background:#f9fafb;border-radius:6px;font-size:12px;';
        detail.textContent = '⏳ 正在加载每日用量...';
        panel.appendChild(detail);

        fetchDailyUsage()
            .then(records => {
                detail.textContent = '';
                const rows = aggregateDaily(records);
                if (records.length === 0 || rows.every(r => r.amount === 0)) {
                    const msg = document.createElement('div');
                    msg.textContent = '本月未识别到用量数据，请按 F12 查看 [Qoder Progress] 日志中的 API 响应结构。';
                    detail.appendChild(msg);
                    return;
                }
                renderTable(detail, rows);
            })
            .catch(err => {
                detail.textContent = `❌ 加载失败：${err.message}（详情见控制台）`;
                console.error('[Qoder Progress]', err);
            });
    }

    function renderTable(detail, rows) {
        const table = document.createElement('table');
        table.style.cssText = 'width:100%;border-collapse:collapse;';

        const thead = document.createElement('thead');
        const hr = document.createElement('tr');
        hr.style.cssText = 'border-bottom:1px solid #e5e7eb;';
        ['日期', '当日用量'].forEach((t, i) => {
            const th = document.createElement('th');
            th.textContent = t;
            th.style.cssText = `padding:6px 8px;${i === 0 ? 'text-align:left' : 'text-align:right'}`;
            hr.appendChild(th);
        });
        thead.appendChild(hr);

        const tbody = document.createElement('tbody');
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom:1px solid #f3f4f6;';
            [r.date, r.amount.toFixed(2)].forEach((t, i) => {
                const td = document.createElement('td');
                td.textContent = t;
                td.style.cssText = `padding:6px 8px;${i === 0 ? 'text-align:left' : 'text-align:right'}`;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // 总计行：显示每日用量总和
        const total = rows.reduce((s, r) => s + r.amount, 0);
        const trTotal = document.createElement('tr');
        trTotal.style.cssText = 'border-top:1px solid #e5e7eb;font-weight:bold;background:#f3f4f6;';
        ['总计', total.toFixed(2)].forEach((t, i) => {
            const td = document.createElement('td');
            td.textContent = t;
            td.style.cssText = `padding:6px 8px;${i === 0 ? 'text-align:left' : 'text-align:right'}`;
            trTotal.appendChild(td);
        });
        tbody.appendChild(trTotal);

        table.append(thead, tbody);
        detail.appendChild(table);
    }

    // ========== 5. 注入：插到"实际用量"（div.DnkF2）下方 ==========
    function findAnchor() {
        // 策略1：直接用"实际用量"容器的 class（用户提供）
        const dnkf = document.querySelector('div.DnkF2');
        if (dnkf) return dnkf;

        // 策略2：精确匹配"实际用量"标题，取最内层匹配元素（class 是构建哈希，可能变化）
        let heading = null;
        for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,span,div,p,dt,summary')) {
            if (el.closest('#qoder-planned-progress')) continue; // 排除自己注入的面板
            const t = (el.textContent || '').trim();
            if (t === '实际用量' || /^Actual Usage$/i.test(t)) heading = el;
        }
        if (heading) {
            // 向上找最近的卡片式容器（最多 6 层）
            let card = heading.parentElement;
            for (let i = 0; i < 6 && card && card !== document.body; i++) {
                if (/card|section|panel|block/i.test((card.className || '').toString())) return card;
                card = card.parentElement;
            }
            return heading.parentElement || heading;
        }

        // 策略3：备选，包含"实际用量"的卡片
        const blocks = document.querySelectorAll('[class*="card"],[class*="section"],[class*="panel"]');
        for (const b of blocks) {
            const t = b.textContent || '';
            if (/实际用量|订阅席位/.test(t) && t.length < 800) return b;
        }
        return document.querySelector('main') || document.body;
    }

    function inject(retries) {
        if (document.getElementById('qoder-planned-progress')) return;
        const anchor = findAnchor();
        if (!anchor || !anchor.parentNode) {
            if (retries > 0) setTimeout(() => inject(retries - 1), 1000);
            return;
        }
        const panel = buildPanel();
        anchor.parentNode.insertBefore(panel, anchor.nextSibling);
        // 等布局稳定后，把进度条起点对齐到原生"实际用量"进度条
        requestAnimationFrame(() => requestAnimationFrame(() => alignProgressStart(panel)));
    }

    // ========== 6. 进度条起点与原生"实际用量"进度条齐平 ==========
    // 在"实际用量"容器（div.DnkF2）内找原生进度条 track：
    // 启发式：高度 3~20px 且宽度 > 100px 的 div，且有子元素作为填充条
    function findNativeTrack() {
        const scope = document.querySelector('div.DnkF2');
        if (!scope) return null;
        const candidates = [];
        for (const d of scope.querySelectorAll('div')) {
            const h = parseFloat(getComputedStyle(d).height) || 0;
            if (h < 3 || h > 20) continue;
            if (d.offsetWidth < 100) continue;
            candidates.push(d);
        }
        return candidates.find(d => {
            const bar = d.firstElementChild;
            return bar && bar.offsetWidth > 0 && bar.offsetWidth <= d.offsetWidth;
        }) || candidates[0] || null;
    }

    // 尾部齐平 + 头部齐平：以原生进度条为基准，同步调整面板的左右 margin
    function alignProgressStart(panel) {
        const native = findNativeTrack();
        const myTrack = panel.querySelector('[data-q-track]');
        if (!native || !myTrack) return;

        const nativeRect = native.getBoundingClientRect();
        const myRect = myTrack.getBoundingClientRect();
        const leftDelta = nativeRect.left - myRect.left;

        if (Math.abs(leftDelta) < 0.5) {
            panel.style.marginLeft = '';
        } else {
            panel.style.marginLeft = `${leftDelta}px`;
        }

        // 尾部齐平：原生进度条右端 vs 面板进度条右端
        const rightDelta = nativeRect.right - myRect.right;
        if (Math.abs(rightDelta) < 0.5) {
            panel.style.marginRight = '';
        } else {
            panel.style.marginRight = `${rightDelta}px`;
        }

        console.log('[Qoder Progress] 进度条对齐: leftDelta=', leftDelta, 'rightDelta=', rightDelta);
    }

    setTimeout(() => inject(10), 500);
})();
