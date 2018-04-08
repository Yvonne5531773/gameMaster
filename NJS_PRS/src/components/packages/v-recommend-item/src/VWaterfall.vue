<template>
	<div class="recommend-waterfall">
		<div class="waterfall-item" :key="index" v-for="(item, index) in data">
			<div class="video-avatar">
				<img v-if="item.avatar" :src="item.avatar"/>
			</div>
			<div class="desc">{{item.desc | clip(40)}}</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'VWaterfall',
		data () {
			return {
				vm: {

				},
			}
		},
		props: {
			data: {
				type: Array
			}
		},
		created () {
			this.init()
		},
		computed: {

		},
		methods: {
			init () {

			},
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
			float right
		.video-avatar
			width 100%
			height 2.75rem
			background-color #d8d8d8
		.desc
			padding-top .1rem
			color #333
			line-height .54rem
			font-size .39rem
			height 1.125rem
			background-color #fbfbfb
</style>
