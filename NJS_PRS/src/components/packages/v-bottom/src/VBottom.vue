<template>
	<div class="bottom-banner">
		<div class="content">
			<div>
				<img :src="bottomPic" />
			</div>
			<p class="txt">{{$txt.TXT_10}}</p>
			<div class="btn">
				<span style="font-weight: 100">{{$txt.TXT_1}}</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'VBottom',
		data () {
			return {
				vm: {

				},
			}
		},
		props: {

		},
		created () {
			this.init()
		},
		computed: {
			bottomPic () {
				return require('assets/img/bottom/bottom-bg.png')
			}
		},
		methods: {
			init () {

			},
		}
	}
</script>

<style lang="stylus">
	.bottom-banner
		position relative
		background-color #fafafa
		height 5.57rem
		.content
			padding .56rem .81rem
			height 4.02rem
			img
				display flex
				position relative
				margin auto
				left 0
				right 0
				width 5.86rem
				height 1.86rem
			.txt
				font-size .38rem
				color #333
				text-align center
			.btn
				position relative
				top .7rem
				left 0
				right 0
				margin auto
				border-radius 1.39rem
				font-size .5rem
				color #fff
				background-image linear-gradient(-90deg, #1D50FF 0%, #00C2FF 100%)
				width 2.78rem
				height 1.11rem
				line-height 1.1rem
				text-align center
				letter-spacing 0
</style>
