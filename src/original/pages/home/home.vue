<template>
    <view class="background">
        <!-- 引用封装的顶部导航组件 -->
        <top-bar :selected="0" />
        <view class="brand-title"><text class="brand-en">ECNU</text><text class="brand-cn">选课猫</text></view>
        <image :src="Logo" class="logo" mode="widthFix" />
        <view class="search-table">
            <view class="search-button" @click="goToSearch">
                <view class="search-surface">
                    <text class="search-placeholder">搜索课程类别、名称、院系或任课教师</text>
                    <view class="search-icon" aria-hidden="true" />
                </view>
            </view>
        </view>
        <ToolBox class="toolbox" />
        <!-- <DebugPanel class="debug-panel" /> -->

        <!-- 切换皮肤：体验新版外观 -->
        <view class="skin-switch-entry" @click="onExperienceNew">
            <text class="skin-switch-text">点击体验新版外观</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import ToolBox from "@/original/pages/home/ToolBox.vue";
import Logo from "@/images/logo.png";
import TopBar from "@/original/components/top-bar/top-bar.vue";
import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import { navigateToPage } from "@/original/utils/navigation";
// 直接引用 store 模块，避免把主包 config 整包（http/init 等）拉进分包页面
import useSkinStore from "@/config/store/skin";

onPageScroll((e) => {
    uni.$emit('pageScroll', e);
});

// 跳转逻辑
const goToSearch = () => {
    navigateToPage("/original/pages/find/index/index");
};

// 切换到「定制版」皮肤
const onExperienceNew = () => {
    console.log('[skin] 体验新版外观 tapped');
    try {
        useSkinStore().switchTo('new');
    } catch (e) {
        console.error('[skin] switchTo 异常，直接 reLaunch 兜底', e);
        uni.reLaunch({ url: '/pages/layout/main' });
    }
};

</script>

<style scoped lang="scss">
.background {
    width: 100vw;
    height: 100vh;
    position: relative;

    .logo {
        position: fixed;
        top: 47vw;
        left: 0;
        right: 0;
        width: 50.3vw;
        height: auto;
        margin: 0 auto;
    }

    .brand-title {
        position: fixed;
        top: 33.5vw;
        display: flex;
        align-items: baseline;
        justify-content: center;
        width: 100vw;
        color: #111111;
        font-family: "Yuanti SC", "STYuanti-SC-Regular", "PingFang SC", "Microsoft YaHei", sans-serif;
        font-weight: 400;
        line-height: 1.25;
        text-align: center;

        .brand-en {
            margin-right: 0.4vw;
            font-size: 7vw;
            letter-spacing: 0.8vw;
        }

        .brand-cn {
            font-size: 7vw;
            letter-spacing: 1vw;
        }
    }

    .search-button {
        position: fixed;
        top: 105vw;
        left: 5vw;
        width: 92vw;
        height: 20vw;

        .search-surface {
            position: absolute;
            top: 3.3vw;
            right: 4.5vw;
            bottom: 4.3vw;
            left: 3.5vw;
            display: flex;
            align-items: center;
            padding-left: 3.6vw;
            border-radius: var(--app-component-radius, 5vw);
            background: linear-gradient(105deg, #e72a25, #ea6045);
            box-shadow: 2px 2px 16px 0 #0000001f;

            &::before {
                content: "";
                position: absolute;
                top: 0.25vw;
                right: 0.25vw;
                bottom: 0.25vw;
                left: 0.25vw;
                border-radius: calc(var(--app-component-radius, 5vw) - 0.25vw);
                background-color: #ffffff;
            }

            .search-placeholder {
                position: relative;
                z-index: 1;
                flex: 1;
                color: #808080;
                font-size: 3.5vw;
                font-weight: 400;
                line-height: 1;
                white-space: nowrap;
            }

            .search-icon {
                position: relative;
                z-index: 1;
                flex-shrink: 0;
                box-sizing: border-box;
                width: 3vw;
                height: 3vw;
                margin-right: 4.4vw;

                &::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    box-sizing: border-box;
                    width: 2.3vw;
                    height: 2.3vw;
                    border: 0.3vw solid #111111;
                    border-radius: 50%;
                }

                &::after {
                    content: "";
                    position: absolute;
                    top: 2.05vw;
                    left: 1.95vw;
                    width: 1.1vw;
                    height: 0.3vw;
                    border-radius: 0.2vw;
                    background-color: #111111;
                    transform: rotate(45deg);
                    transform-origin: left center;
                }
            }
        }
    }

    .toolbox {
        margin-top: 125vw;
        position: fixed;
    }

    .skin-switch-entry {
        position: fixed;
        // 用显式 left 居中，避免 translateX(-50%) 在小程序里命中区域不跟随 transform
        left: 30vw;
        bottom: calc(7vw + env(safe-area-inset-bottom));
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40vw;
        height: 9.5vw;
        border-radius: 999rpx;
        // 沿用旧版一贯的品牌红（与顶部导航一致）
        background-color: #b70030;
        box-shadow: 0 0.5vw 1.6vw 0 rgba(183, 0, 48, 0.22);

        .skin-switch-text {
            color: #ffffff;
            font-size: 3.5vw;
            font-weight: 500;
            letter-spacing: 0.2vw;
        }

        &:active {
            opacity: 0.82;
        }
    }

    .mewochat {
        margin-top: 150vw;
    }

}
</style>
