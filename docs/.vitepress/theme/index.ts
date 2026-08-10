// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "markdown-it-github-alerts/styles/github-base.css";
import "markdown-it-github-alerts/styles/github-colors-light.css";
import "markdown-it-github-alerts/styles/github-colors-dark-class.css";
import CryptoPrice from "./components/CryptoPrice.vue";
import Layout from "../components/Layout.vue";
import PullToRefresh from "../components/PullToRefresh.vue";
import SidebarProfileWrapper from "../components/SidebarProfileWrapper.vue";
import NavLeftActions from "../components/NavLeftActions.vue";
import Copyright from "../components/Copyright.vue";
import ExplorerBreadcrumb from "../components/ExplorerBreadcrumb.vue";
import FrontmatterBlock from "../components/FrontmatterBlock.vue";
import { onMounted, watch, nextTick } from "vue";
import { useRoute } from "vitepress";
import mediumZoom from "medium-zoom";

export default {
	extends: DefaultTheme,
	Layout: () => {
		return h(PullToRefresh, null, {
			default: () =>
				h(DefaultTheme.Layout, null, {
					"nav-bar-content-before": () => h(NavLeftActions),
					"layout-bottom": () => [h(Layout), h(SidebarProfileWrapper)],
					"sidebar-nav-after": () => h(Copyright, { placement: "sidebar" }),
					"doc-before": () => [h(ExplorerBreadcrumb), h(FrontmatterBlock)],
					"doc-after": () => h(Copyright, { placement: "doc" }),
				}),
		});
	},
	setup() {
		const route = useRoute();
		const initZoom = () => {
			// 给所有文章内容的图片添加 medium-zoom
			// 排除 .vp-doc 以外的图片（比如 logo）
			mediumZoom(".vp-doc img", { background: "var(--vp-c-bg)" });
		};
		onMounted(() => {
			initZoom();
		});
		watch(
			() => route.path,
			() => nextTick(() => initZoom()),
		);
	},
	enhanceApp({ app, router, siteData }) {
		app.component("CryptoPrice", CryptoPrice);
	},
} satisfies Theme;
