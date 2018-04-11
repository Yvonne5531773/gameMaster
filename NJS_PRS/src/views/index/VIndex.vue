<template>
	<div class='index' ref="index">
		<VBanner v-if="!isIOS()"></VBanner>
		<VVideo></VVideo>
		<VRecommend></VRecommend>
		<VBottom v-if="!isIOS()"></VBottom>
	</div>
</template>
<script>
	import { request } from 'utils/index'
	export default {
		created () {
			this.init()
		},
		methods: {
			async init () {
				const videoId = this.getVideoId()
				this.setVideoId(videoId)
				//微信初始化
//				this.weixinInit()
				//展示上报
				this.report({
					action: 1
				})
			},
			getVideoId () {
				const param = 'newsid'
				return request(param)
			},
		},
	}
</script>

<style lang='stylus' scoped>
	.index
		position absolute
		margin 0
		padding 0
		border 0
		width 100%
		height 100%
		-webkit-box-orient vertical
		-webkit-box-direction normal
		-ms-flex-direction column
		flex-direction column
		-webkit-box-align stretch
		-ms-flex-align stretch
		align-items stretch
		-ms-flex-negative 0
		flex-shrink 0
</style>