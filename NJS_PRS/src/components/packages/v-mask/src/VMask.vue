<template>
	<div class="video-mask">
		<div class="content">
			<p>{{$txt.TXT_2}}</p>
			<a class="play-btn">{{$txt.TXT_3}}</a>
			<a class="download-btn">{{$txt.TXT_4}}</a>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'VMask',
		data () {
			return {

			}
		},
		props: {

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
	.video-mask
		position relative
		margin-top .69rem
		width 100%
		height 5.2rem
		background-color rgba(0,0,0,0.8)
		z-index 999
		.content
			position absolute
			top 50%
			left 50%
			width 100%
			text-align center
			-webkit-transform translate(-50%, -50%)
			transform translate(-50%, -50%)
			p
				color rgba(255,255,255,0.7)
				height .25rem
				font-size .18rem
				margin-top .11rem
			a
				display inline-block
				margin-top .28rem
				border-radius 2px
				-webkit-box-sizing border-box
				box-sizing border-box
				font-weight bolder
				width 1.22rem
				height .44rem
				line-height .44rem
				font-size .19rem
			.play-btn
				margin-right .44rem
				border 1px solid #ffffff
				color #ffffff
			.download-btn
				background-color #ffffff
				color #009AFF
</style>
