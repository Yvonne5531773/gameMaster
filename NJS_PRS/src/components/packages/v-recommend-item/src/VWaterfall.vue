<template>
	<div class="recommend-waterfall">
		<div @click="open(item)" class="waterfall-item" :key="index" v-for="(item, index) in data">
			<div class="video-avatar" :style="getAvatar(item)"></div>
			<div class="desc">{{item.desc | clip(40)}}</div>
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
		methods: {
			getAvatar (item) {
				return {
					backgroundImage: `url(${item.avatar})`
				}
			},
			open (item) {
				if(!item) return
				this.report({action: 8})
				const newsid = item.contentid
				this.isIOS() && (location.href = `/index?${toQuery({newsid: newsid})}`)
				!this.isIOS() && this.activate()
			}
		}
	}
</script>

<style lang="stylus">
	.waterfall-item
		display inline-block
		position relative
		margin-bottom .4rem
		padding-right .13rem
		-webkit-box-sizing border-box
		box-sizing border-box
		width 50%
		height 3.8rem
		-webkit-transition all 1s ease-in-out
		&:nth-child(2n)
			padding-left .13rem
			padding-right 0
			/*float right*/
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
