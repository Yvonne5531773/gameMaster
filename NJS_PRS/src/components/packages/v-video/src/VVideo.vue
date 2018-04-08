<template>
	<section class="video-container" ref="video">
		<keep-alive>
			<component :is='current' :videoData="videoData"></component>
		</keep-alive>
		<VDownloadBottom></VDownloadBottom>
		<VVideoHeader :title="videoData.title"></VVideoHeader>
		<VUserShare></VUserShare>
	</section>
</template>

<script>
	import {setStore} from '../../../../utils/index'
	export default {
		name: 'VVideo',
		data () {
			return {
				vm: {
					components: ['VPlayer', 'VNoPlayer']
				},
			}
		},
		created () {
			this.init()
			this.storeVideoData()
		},
		props: {

		},
		computed: {
			current () {
				return this.vm.components[0]
			}
		},
		methods: {
			init () {
				this.videoData= {
					id: `v${Math.random()}`.slice(3).toString(16).slice(0, 4),
					poster: '',
					src: 'http://v.g.m.liebao.cn/trans/a87ff1deaf6c7cd1258aa875bc3b8bb3.mp4',
					description: '游戏超人',
					title: '哪位大神告诉我这是怎么了 ？千万里路去和队友汇合,忽然就没了哪位大神告诉我这是怎么了 ？千万里路去和队友汇合,忽然就没了',
				}
			},
			storeVideoData () {
				const key = 'VIDEO_DATA'
				setStore(key, JSON.stringify(this.videoData))
			}
		}
	}
</script>

<style lang="stylus">
	.video-container
		position relative
		top 0
		left 0
		width 100%
</style>
