<template>
	<div class="video-player">
		<!--qq分享默认会取第一个img标签的src-->
		<img class="avatar" :src="videoData.poster"/>
		<div class="placeholder" :id="videoData.id"></div>
		<VMask></VMask>
	</div>
</template>

<script>
	export default {
		name: 'VPlayer',
		data () {
			return {

			}
		},
		props: {
			videoData: {
				type: Object
			}
		},
		mounted () {
			this.player = this.init()
			this.ready()
		},
		computed: {

		},
		methods: {
			init () {
				const criteria = {
					id: this.videoData.id,
					width: '100%',
					height: '100%',
					plugins: {
						vjs_play: {},
						vjs_poster: {
							src: this.videoData.poster,
						},
						vjs_monitor: {
							handle: type => this.hanleEvent(type),
						},
					},
					inline: true,
				},
					player = this.getPlayer(criteria)
				return player
			},
			ready () {
				console.log('in ready this.player', this.player)
				console.log('in ready this.$ua', this.$ua)
				const src = this.videoData.src
				this.player.play(src).then(function (vjs) {
					console.log('vjs', vjs)
					vjs.preload('metadata')
					vjs.volume(0.65)
					window.vjs = vjs
					window.isFullscreen = false
					if (document.getElementsByTagName('video') && this.$ua.os.android) {
						document.getElementsByTagName('video')[0].addEventListener('x5videoenterfullscreen', () => {
							window.isFullscreen = true
						})
						document.getElementsByTagName('video')[0].addEventListener('x5videoexitfullscreen', () => {
							window.isFullscreen = false
						})
					}
				}.bind(this))
			},
			hanleEvent (type) {
				if (type === 'touchstart') {
					this.isTouched = true
				}
				if (type === 'touchend') {
					this.isTouched = false
//					if (this.$ua.os.ios && this.$ua.os.version >= 11) {
//						setTimeout(() => {
//							this.activateApp()
//						}, 1000)
//					} else {
//						this.activateApp()
//					}
				}
				if (type === 'play') {
					console.log('in play')
					if (!this.firstPlay) {

					}
					setTimeout(() => {
//						if (window.group_id !== '6522816111426142728' && simplify.request('ft') !== '1') {
//							this.showMask();
//							this.play10s();
//						}
					}, 1000);
				}
				if (type === 'pause') {

				}
				if (type === 'ended') {

				}
				if (type === 'error') {
					if (window.vjs.error().message) {
						console.log('error: ', window.vjs.error().message)
					}
					if (!this.hasRetry) {
						const player = this.init()
						player.play()
						this.hasRetry = true;
					}
				}
			}
		}
	}
</script>

<style src="./video.css"></style>
<style lang="stylus">
	.video-player
		height 5.2rem
		overflow-y hidden
		background-color rgba(0,0,0,0.8)
		.avatar
			position absolute
			width 0
			height 0
		.placeholder
			height 5.2rem
</style>
