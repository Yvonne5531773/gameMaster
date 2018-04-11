<template>
	<div class="video-player">
		<!--qq分享默认会取第一个img标签的src-->
		<img class="avatar" :src="videoData.poster"/>
		<VMask v-show="vm && vm.ended" :replay="replay"></VMask>
		<div v-show="vm && !vm.ended" class="placeholder" :id="videoData.id"></div>
	</div>
</template>

<script>
	export default {
		name: 'VPlayer',
		data () {
			return {
				vm: {
					ended: false,
					firstPlay: true,
				}
			}
		},
		props: {
			videoData: {
				type: Object
			}
		},
		mounted () {
			if(_.isEmpty(this.videoData)) return
			this.player = this.init()
			this.ready()
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
				const src = this.videoData.src
				this.player.play(src).then(function (vjs) {
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
//				if (type === 'touchstart') {
//
//				}
				if (type === 'touchend') {
					//唤起APP
					!this.isIOS() && this.activate({
						skipDownload: true
					})
				}
				if (type === 'play') {
					this.vm.firstPlay && (this.report({action: 5}), this.vm.firstPlay = false)
				}
//				if (type === 'pause') {
//
//				}
				if (type === 'ended') {
					this.vm.ended = true
				}
				if (type === 'error') {
					if (window.vjs.error().message) {
						console.log('error: ', window.vjs.error().message)
					}
					if (!this.hasRetry) {
						this.replay()
					}
				}
			},
			replay () {
				this.player.config.autoplay = true
				this.player.play(this.videoData.src)
				this.vm.ended = false
				this.hasRetry = true
			}
		}
	}
</script>

<style src="./video.css"></style>
<style lang="stylus">
	.video-player
		height 5.6rem
		overflow-y hidden
		background-color rgba(0,0,0,0.8)
		.avatar
			position absolute
			width 0
			height 0
		.placeholder
			height 100%
</style>
