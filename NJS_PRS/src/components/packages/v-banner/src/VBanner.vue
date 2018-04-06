<template>
	<section class="banner-container banner-top">
		<div class="banner-pannel pannel-top show-top-pannel">
			<div class="slider-container" :style="containerStyle">
				<div :class="slideListClass" :style="slideListStyle">
					<VBannerItem :key="index" :item="slide" :itemStyle="itemStyle" :current="index===vm.currentIndex+1" :touchstart="handleStart" :touchmove="handleMove" :touchend="handleEnd" v-for="(slide, index) in vm.slideList"></VBannerItem>
				</div>
				<div class="slider-dot-list">
					<span :class="{'dot-item dot-current':index===vm.currentIndex, 'dot-item':index!==vm.currentIndex}" :key="index" v-for="(slide, index) in slides"></span>
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
					title: '111',
					img: 'http://p3.pstatp.com/video1609/6c2d0004fb54444772ce'
				}, {
					title: '222',
					img: 'http://p3.pstatp.com/video1609/6c2d0004fb54444772ce'
				}, {
					title: '333',
					img: 'http://p3.pstatp.com/video1609/6c2d0004fb54444772ce'
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
		created () {
			this.init()
			this.intervalId = this.slideInterval()
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
					width: width* this.vm.slideList.length + 'px',
					transform: `translate3d(${translateX}px, 0, 0)`,
					WebkitTransform: `translate3d(${translateX}px, 0, 0)`,
				}
			},
			itemStyle () {
				const width = this.width || window.innerWidth
				return {width: width+'px'}
			}
		},
		methods: {
			init () {
				this.vm.slideLength = this.slides.length
				this.vm.slideList = _.concat(this.slides[this.vm.slideLength-1], this.slides, this.slides[0])
			},
			slideInterval () {
				this.vm.showAnimation = true
				return setInterval(() => {
//					this.slideNext()
				}, this.intervalTime)
			},
			slideNext () {
				this.vm.showAnimation = true
				const count = this.vm.slideLength
				this.vm.currentIndex += 1
				setTimeout( () => {
					this.vm.currentIndex === count &&
					(this.vm.showAnimation = false, this.vm.currentIndex = 0)
				}, this.animationTime)
			},
			handleStart (event) {
				this.vm.touchStart = event.changedTouches[0]
				this.vm.showAnimation = false
				this.intervalId && clearInterval(this.intervalId)
			},
			handleMove (event) {
				const touch = event.changedTouches[0]
				this.vm.move = {
					x: touch.clientX - this.vm.touchStart.clientX,
					y: touch.clientY - this.vm.touchStart.clientY,
				}
			},
			handleEnd (event) {
				const touchEnd = event.changedTouches[0],
					moveX = touchEnd.clientX - this.vm.touchStart.clientX,
					itemCount = this.vm.slideLength
				let nextIndex = Math.abs(moveX) < this.minWidth? this.vm.currentIndex:(moveX < 0? this.vm.currentIndex+1:this.vm.currentIndex-1)
				this.vm.currentIndex = nextIndex
				this.vm.move = {
					x: 0,
					y: 0
				}
				this.vm.showAnimation = true
				setTimeout(() => {
					this.vm.showAnimation = false
					nextIndex === itemCount && (this.vm.currentIndex = 0)
					nextIndex === -1 && (this.vm.currentIndex = itemCount-1)
				}, this.animationTime)
				this.intervalId = this.slideInterval()
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
		height 1.39rem
		z-index 1000
	.banner-top
		position relative
		.banner-pannel
			position fixed
			width 100%
			height 1.39rem
			background-image linear-gradient(-90deg, #1D50FF 0%, #00C2FF 100%)
			background-repeat no-repeat
			background-position center bottom
			background-size: 100% 100%
			color #fff
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
				.slider-dot-list
					position absolute
					bottom 0rem
					left 50%
					-webkit-transform translate(-50%, 0)
					transform translate(-50%, 0)
					.dot-item
						display inline-block
						width .1rem
						height .1rem
						margin 0 .07rem
						border-radius 50%
						opacity .7
						background-color #fff
					.dot-current
						opacity 1
</style>
