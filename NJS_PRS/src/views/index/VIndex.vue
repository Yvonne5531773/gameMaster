<template>
	<div class='v-index'>
		<VBanner v-if="!isIOS()"></VBanner>
		<VVideo></VVideo>
		<VRecommend></VRecommend>
		<VBottom v-if="!isIOS()"></VBottom>
	</div>
</template>
<script>
	import { request } from 'utils/index'
	import adapter from '../../adapter/index'

	export default {
		created () {
			this.init()
		},
		methods: {
			async init () {
				//页面初始化
				new adapter()

				//video id初始化
				this.initVideoId()

				//展示上报
				this.report({
					action: 1
				})
			},
			initVideoId () {
//				const param = 'newsid',
//					videoId = request(param)
//				this.setVideoId(videoId)
				const videoId = this.$route.query.newsid
//					videoId = request(param)
				this.setVideoId(videoId)
			},
		},
	}
</script>

<style lang='stylus' scoped>
	.v-index
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