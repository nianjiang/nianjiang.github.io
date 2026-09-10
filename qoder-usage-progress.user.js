// ==UserScript==
// @name         Qoder Usage Planned Progress
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  在 Qoder Usage 页面显示当月规划使用进度（按日期计算应该使用的百分比）
// @author       You
// @match        https://qoder.com/account/usage*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // 每月 Credits 总量，按自己的订阅修改
    const MONTHLY_TOTAL = 3000;

    function getPlanned() {
        const now = new Date();
        const day = now.getDate();
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const pct = (day / days) * 100;
        return { day, days, pct, amount: (MONTHLY_TOTAL * pct) / 100 };
    }

    function buildPanel() {
        const p = getPlanned();

        const panel = document.createElement('div');
        panel.id = 'qoder-planned-progress';
        panel.style.cssText = [
            'margin: 16px 0',
            'padding: 12px 16px',
            'border: 1px solid #e5e7eb',
            'border-radius: 8px',
            'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            'font-size: 13px',
            'color: #374151'
        ].join(';');

        // 标签行：左标题，右数值
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:6px;';

        const title = document.createElement('span');
        title.textContent = '📅 规划进度（应该已用）';

        const value = document.createElement('span');
        value.textContent = `${p.pct.toFixed(1)}%（${p.amount.toFixed(0)} / ${MONTHLY_TOTAL}）`;

        header.append(title, value);

        // 进度条
        const track = document.createElement('div');
        track.style.cssText = 'background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;';

        const bar = document.createElement('div');
        bar.style.cssText = [
            `width:${Math.min(p.pct, 100)}%`,
            'height:100%',
            'background:linear-gradient(90deg,#f59e0b,#fbbf24)',
            'border-radius:4px',
            'transition:width .3s ease'
        ].join(';');
        track.appendChild(bar);

        // 底部说明
        const foot = document.createElement('div');
        foot.style.cssText = 'margin-top:6px;font-size:12px;color:#6b7280;';
        foot.textContent = `本月第 ${p.day} 天 / 共 ${p.days} 天`;

        panel.append(header, track, foot);
        return panel;
    }

    function findAnchor() {
        // 优先插在"订阅席位/资源"相关区块之后
        const blocks = document.querySelectorAll('[class*="card"],[class*="section"],[class*="panel"]');
        for (const b of blocks) {
            const t = b.textContent || '';
            if (/订阅席位|席位|Subscription|Credits/i.test(t) && t.length < 500) {
                return b;
            }
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
        anchor.parentNode.insertBefore(buildPanel(), anchor.nextSibling);
    }

    // 等待 SPA 渲染，最多重试 10 次
    setTimeout(() => inject(10), 500);
})();
