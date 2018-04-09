<template>
	<section class="video-container" ref="video">
		<div class="video-content">
			<keep-alive>
				<component v-if="videoData" :is='current' :videoData="videoData"></component>
			</keep-alive>
		</div>
		<VDownloadBottom></VDownloadBottom>
		<VVideoHeader v-if="videoData" :title="videoData.title"></VVideoHeader>
		<VUserShare></VUserShare>
	</section>
</template>

<script>
	import { mapState } from 'vuex'
	import ua from '../../../../ua/index'
	import { urls } from 'config/index'
	import { setStore, getBrowserName, toQuery, request } from 'utils/index'
	export default {
		name: 'VVideo',
		data () {
			return {
				videoData: null,
				vm: {
					components: ['VPlayer', 'VNoPlayer']
				},
			}
		},
		async created () {
			await this.init()
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
			async init () {
//				this.videoData= {
//					id: `v${Math.random()}`.slice(3).toString(16).slice(0, 4),
//					poster: '',
//					src: 'http://v.g.m.liebao.cn/trans/a87ff1deaf6c7cd1258aa875bc3b8bb3.mp4',
//					description: '游戏超人',
//					title: '哪位大神告诉我这是怎么了 ？千万里路去和队友汇合,忽然就没了哪位大神告诉我这是怎么了 ？千万里路去和队友汇合,忽然就没了',
//				}
				await this.fetchVideoData()
			},
			async fetchVideoData () {
				const uuid = this.getId('uuid'),
					aid = this.getId('aid'),
					videoId = this.getVideoId(),
					model = getBrowserName(),
					url = urls.detail + '&' + toQuery({
						uuid: uuid,
						aid: aid,
						contentid: videoId,
						model: model
					})
				const videoData = await this.fetch(url)
				console.log('in fetchVideoData videoData', videoData)
				!_.isEmpty(videoData) && (this.videoData = this.dto(videoData.data[0]))
			},
			storeVideoData () {
				const key = 'VIDEO_DATA'
				setStore(key, JSON.stringify(this.videoData))
			},
			getVideoId () {
				const param = 'newsid'
				return request(param)
			},
			dto (data) {
				const img = !_.isEmpty(data.images)? data.images[0] : '',
					src = data.originalurl,
					title = data.title
				return {
					id: `v${Math.random()}`.slice(3).toString(16).slice(0, 4),
					poster: img,
					src: src,
					description: title,
					title: title,
				}
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
		.video-content
			height 5.6rem
</style>
