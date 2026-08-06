<script setup lang="ts">
// 调光控制台背景 - 阳极氧化铝前面板：拉丝纹理 + 安装螺丝 + 面板线槽 + 暗角
// 仅用于 console 主题
</script>

<template>
  <div class="console-bg">
    <!-- 铝面板底 + 拉丝 -->
    <div class="cb-metal" />

    <!-- 面板线槽 - 模块分区线 -->
    <div class="cb-line cb-line-top" />
    <div class="cb-line cb-line-bottom" />

    <!-- 安装螺丝 -->
    <div class="cb-screw cb-screw-tl" />
    <div class="cb-screw cb-screw-tr" />
    <div class="cb-screw cb-screw-bl" />
    <div class="cb-screw cb-screw-br" />

    <!-- 顶部琥珀"通电"余光 -->
    <div class="cb-power" />

    <!-- 暗角 -->
    <div class="cb-vignette" />
  </div>
</template>

<style scoped>
.console-bg {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: hsl(var(--bg-page));
}

/* 阳极氧化铝 + 水平拉丝 */
.cb-metal {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, hsl(0 0% 100% / 0.035) 0%, transparent 14%, transparent 86%, hsl(0 0% 0% / 0.18) 100%),
    repeating-linear-gradient(90deg, hsl(0 0% 100% / 0.015) 0 1px, transparent 1px 3px);
}

/* 面板线槽 - 机械分区刻线 */
.cb-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(0 0% 0% / 0.4) 12%,
    hsl(0 0% 0% / 0.4) 88%,
    transparent 100%
  );
  box-shadow: 0 1px 0 hsl(0 0% 100% / 0.03);
}

.cb-line-top {
  top: 16%;
}

.cb-line-bottom {
  bottom: 16%;
}

/* 安装螺丝 */
.cb-screw {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 45%,
    hsl(0 0% 62% / 0.22) 0 2px,
    hsl(0 0% 0% / 0.5) 3px 4px,
    transparent 5px
  );
  box-shadow: inset 0 1px 1px hsl(0 0% 100% / 0.12);
}

.cb-screw-tl { top: 18px; left: 22px; }
.cb-screw-tr { top: 18px; right: 22px; }
.cb-screw-bl { bottom: 18px; left: 22px; }
.cb-screw-br { bottom: 18px; right: 22px; }

/* 顶部琥珀余光 - 设备通电感 */
.cb-power {
  position: absolute;
  top: -18vh;
  left: 50%;
  transform: translateX(-50%);
  width: 70vw;
  height: 34vh;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 100%, hsl(var(--cs-amber) / 0.05) 0%, transparent 70%);
}

/* 暗角 - 面板纵深 */
.cb-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 58%, hsl(220 14% 4% / 0.42) 100%);
}
</style>
