<template>
	<div class="banner-container banner-top">
		<div class="banner-pannel pannel-top show-top-pannel">
			<div class="slider-container" :style="sliderStyle">

			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'VBanner',
		data() {
			return {

			}
		},
		props: {
			width: {
				type: Number
			},
			height: {
				type: Number
			}
		},
		computed: {
			sliderStyle () {
				return {
					width: this.width || '100%',
					height: this.height || '100%',
				}
			}
		}
	}
</script>

<style lang="stylus">
	.banner-container
		font-family STHeiti,'Microsoft YaHei',Helvetica,Arial,sans-serif
		-webkit-text-size-adjust none
		word-break break-word
		width 100%
		height 50px
		z-index 1000
	[data-dpr="2"] .banner-container
		height 100px
	[data-dpr="3"] .banner-container
		height 150px
	.banner-top
		position relative
		.banner-pannel
			position fixed
			width 100%
			height 50px
			background-image -webkit-gradient(linear, left top, right top, from(#202225), to(#1a191f))
			background-image linear-gradient(to right, #202225, #1a191f)
			background-repeat no-repeat
			background-position center bottom
			background-size: 100% 100%
			color #fff
		[data-dpr="2"] .banner-pannel
			height 100px
		[data-dpr="3"] .banner-pannel
			height 150px
		.pannel-top
			top 0
		.show-top-pannel
			-webkit-transform translateY(0)
			transform translateY(0)
			-webkit-transition all 500ms cubic-bezier(.19, 1, .22, 1)
			transition all 500ms cubic-bezier(.19, 1, .22, 1)
			.slider-container
				position relative
</style>
