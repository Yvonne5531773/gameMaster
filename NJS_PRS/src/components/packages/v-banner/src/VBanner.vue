<template>
	<section class="banner-container banner-top">
		<div class="banner-pannel pannel-top show-top-pannel">
			<div class="slider-container" :style="containerStyle">
				<div :class="slideListClass" :style="slideListStyle">

				</div>
			</div>
		</div>
	</section>
</template>

<script>
	export default {
		name: 'VBanner',
		data () {
			return {
				vm: {
					showAnimation: false,
					currentIndex: 0,
					touchStart: {
						clientX: 0,
						clientY: 0
					},
					move: {
						x: 0,
						y: 0
					},
				},
				slides: [{
						desc: '111'
					}, {
						desc: '222'
					}, {
						desc: '333'
					}],
				minWidth: 100,
				intervalTime: 3* 1000,
				animationTime: .5* 1000,
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
			containerStyle () {
				return {
					width: this.width || '100%',
					height: this.height || '100%',
				}
			},
			slideListClass () {
				return this.vm.showAnimation? 'slider-list clearfix showAnimation':'slider-list clearfix'
			},
			slideListStyle () {
				const width = this.width || window.innerWidth,
					translateX = -(this.vm.currentIndex + 1) * width + this.vm.move.x
				return {
					width: width* this.slides.length + 'px',
					transform: `translate3d(${translateX}px, 0, 0)`,
					WebkitTransform: `translate3d(${translateX}px, 0, 0)`,
				}
			}
		},
		mounted () {
			this.intervalId = this.slideInterval()
		},
		methods: {
			slideInterval () {
				this.vm.showAnimation = true
				return setInterval(() => {
					this.slideNext()
				}, this.intervalTime)
			},
			slideNext () {
				const count = this.slides.length
				this.vm.currentIndex += 1
				setTimeout( () => {
					this.vm.currentIndex === count &&
					(this.vm.showAnimation = false, this.vm.currentIndex = 0)
				}, this.animationTime)
			},
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
				.slider-list
					overflow hidden
					position relative
					height 100%
				.showAnimation
					-webkit-transition all .5s ease
					transition all .5s ease
</style>
