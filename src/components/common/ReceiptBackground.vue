<script setup lang="ts">
// 运维小票背景 - 热敏纸面：顶部锯齿撕边 + 穿孔线 + 条码 + END OF LOG 尾行 + 纸面噪点
// 仅用于 receipt 主题
</script>

<template>
  <div class="receipt-bg">
    <!-- 纸面底 -->
    <div class="rb-paper" />

    <!-- 淡横线 - 账页栏线 -->
    <div class="rb-rules" />

    <!-- 顶部锯齿撕边 -->
    <div class="rb-tear" />

    <!-- 穿孔线 -->
    <div class="rb-perf" />

    <!-- 底部条码 -->
    <div class="rb-barcode" />

    <!-- 打印尾行 -->
    <div class="rb-footer">— END OF LOG —</div>

    <!-- 纸面噪点 -->
    <div class="rb-grain" />
  </div>
</template>

<style scoped>
.receipt-bg {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: hsl(var(--bg-page));
}

.rb-paper {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, hsl(0 0% 100% / 0.4) 0%, transparent 60%);
}

/* 账页栏线 - 极淡横格 */
.rb-rules {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(180deg, hsl(var(--r-ink) / 0.035) 0 1px, transparent 1px 26px);
}

/* 顶部锯齿撕边 */
.rb-tear {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 9px;
  pointer-events: none;
  background-color: hsl(var(--r-ink) / 0.06);
  background-image:
    linear-gradient(135deg, hsl(var(--bg-page)) 0 50%, transparent 50% 100%),
    linear-gradient(45deg, hsl(var(--bg-page)) 0 50%, transparent 50% 100%);
  background-size: 12px 12px, 12px 12px;
  background-position: 0 0, 6px 0;
  box-shadow: 0 1px 0 hsl(var(--r-ink) / 0.05);
}

/* 穿孔线 */
.rb-perf {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  background: repeating-linear-gradient(90deg, hsl(var(--r-ink) / 0.35) 0 6px, transparent 6px 13px);
}

.rb-perf::before,
.rb-perf::after {
  content: '';
  position: absolute;
  top: -4.5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, hsl(var(--r-ink) / 0.45) 0 2px, transparent 3px);
}

.rb-perf::before { left: 6px; }
.rb-perf::after { right: 6px; }

/* 底部条码 */
.rb-barcode {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 52px;
  width: 170px;
  height: 26px;
  pointer-events: none;
  opacity: 0.5;
  background-image: repeating-linear-gradient(
    90deg,
    hsl(var(--r-ink)) 0 2px, transparent 2px 4px,
    hsl(var(--r-ink) / 0.6) 4px 5px, transparent 5px 7px,
    hsl(var(--r-ink)) 7px 9px, transparent 9px 12px
  );
}

/* 打印尾行 */
.rb-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  text-align: center;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  color: hsl(var(--r-faint) / 0.9);
}

.rb-footer::before {
  content: '';
  display: block;
  width: 68%;
  margin: 0 auto 8px;
  height: 1px;
  background: repeating-linear-gradient(90deg, hsl(var(--r-ink) / 0.3) 0 4px, transparent 4px 9px);
}

/* 纸面噪点 */
.rb-grain {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
