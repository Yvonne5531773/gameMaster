<template>
	<div class="recommend-waterfall">
		<div @click="open(item)" class="waterfall-item" :key="index" v-for="(item, index) in data">
			<div class="video-avatar" :style="getAvatar(item)"></div>
			<div class="desc">
				<p>{{item.desc | clip(40)}}</p>
			</div>
		</div>
	</div>
</template>

<script>
	import { toQuery } from 'utils/index'
	export default {
		name: 'VWaterfall',
		props: {
			data: {
				type: Array
			}
		},
		watch: {
			'$route' (to, from) {
				location.reload()
			}
		},
		methods: {
			getAvatar (item) {
				return {
					backgroundImage: `url(${item.avatar})`
				}
			},
			open (item) {
				if(!item) return
				this.report({action: 8})
				const newsid = item.contentid,
					urlObj = {
						path: 'player',
						query: {
							newsid: newsid
						}
					}
				this.setVideoId(newsid)
				this.isIOS() && (this.$router.push(urlObj))
				!this.isIOS() && this.activate()
			}
		}
	}
</script>

<style lang="stylus">
	.waterfall-item
		display inline-block
		position relative
		padding-right .13rem
		-webkit-box-sizing border-box
		box-sizing border-box
		width 50%
		height 4.3rem
		vertical-align top
		-webkit-transition all 1s ease-in-out
		&:nth-child(2n)
			padding-left .13rem
			padding-right 0
		.video-avatar
			width 100%
			height 2.75rem
			background-position center
			background-color #d8d8d8
		.desc
			display -webkit-box
			display box
			-webkit-box-orient vertical
			-webkit-line-clamp 2
			overflow hidden
			text-overflow ellipsis
			padding-top .1rem
			color #333
			line-height .54rem
			font-size .39rem
			height 1.1rem
			background-color #fbfbfb
</style>
