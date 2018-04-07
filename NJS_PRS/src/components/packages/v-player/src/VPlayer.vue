<template>
	<section class="video-player">
		<!--qq分享默认会取第一个img标签的src-->
		<img class="avatar" :src="vm.videoData.poster"/>
		<div class="placeholder" :id="vm.videoData.id"></div>
		<VMask></VMask>
	</section>
</template>

<script>
	export default {
		name: 'VPlayer',
		data () {
			return {
				vm: {
					videoData: {
						id: `v${Math.random()}`.slice(3).toString(16).slice(0, 4),
						poster: '',
						src: 'http://v.g.m.liebao.cn/trans/a87ff1deaf6c7cd1258aa875bc3b8bb3.mp4',
					}
				},
			}
		},
		props: {

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
					id: this.vm.videoData.id,
					width: '100%',
					height: '100%',
					plugins: {
						vjs_play: {},
						vjs_poster: {
							src: this.vm.videoData.poster,
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
				const src = this.vm.videoData.src
				this.player.play(src).then(function (vjs) {
					console.log('vjs', vjs)
					vjs.preload('metadata')
					vjs.volume(0.65)
					window.vjs = vjs
					window.isFullscreen = false
					if (document.getElementsByTagName('video') && this.$ua.os.android && !window.isToutiaoVideo && simplify.request('ft') !== '1') {
						document.getElementsByTagName('video')[0].addEventListener('x5videoenterfullscreen', () => {
							window.isFullscreen = true;
							// 安卓：（非全屏播放至20%弹出浮层），点击全屏直接下载
							if (this.$ua.os.android) {
								const currentTime = window.vjs.cache_.currentTime
								if (currentTime <= 1) {
									utils.ttSessionStorage.setItem('auto_full_screen', true)
									if (utils.fullscreenDownloadTest.control) {
										window.gaevent('video_fullscreen_control', 'auto')
									}
									if (utils.fullscreenDownloadTest.test1) {
										window.gaevent('video_fullscreen_test1', 'auto')
									}
									if (utils.fullscreenDownloadTest.test2) {
										window.gaevent('video_fullscreen_test2', 'auto')
									}
									if (utils.fullscreenDownloadTest.test3) {
										window.gaevent('video_fullscreen_test3', 'auto')
									}
									if (utils.fullscreenDownloadTest.test4) {
										window.gaevent('video_fullscreen_test4', 'auto')
									}
								}
								self.fullScreenDownload()
							}
						});
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
