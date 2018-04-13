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
	import { setStore, getBrowserName, toQuery } from 'utils/index'
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
			//微信初始化
			this.initWeixin(this.videoData)
			//头文件初始化
			this.initHeadInfo()
		},
		computed: {
			...mapState(['videoId']),
			current () {
				return this.vm.components[0]
			}
		},
		methods: {
			async init () {
				await this.fetchVideoData()
			},
			async fetchVideoData () {
				const uuid = this.getId('uuid'),
					aid = this.getId('aid'),
					videoId = this.videoId,
					model = getBrowserName(),
					url = urls.detail + '&' + toQuery({
						uuid: uuid,
						aid: aid,
						contentid: videoId,
						model: model
					})
				let videoData
				try {
					videoData = await this.fetch(url)
				} catch (e) {
					console.log('video error:', e)
				}
				this.setVideoId(videoId)
				this.videoData = !_.isEmpty(videoData)? this.dto(videoData.data[0]):{}
			},
			dto (data) {
				if(!data) return
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
			},
			initHeadInfo () {
				const children = document.getElementsByTagName('head')[0].children,
					ele = document.createElement('meta'),
					firstImage = document.createElement('img'),
					titleEle = _.find(children, {tagName: 'TITLE'})
				ele.name = 'description'
				ele.content = _.has(this.videoData, 'description')? this.videoData.description:''
				firstImage.src = _.has(this.videoData, 'poster')? this.videoData.poster:''
				document.getElementsByTagName('head')[0].appendChild(ele)
				firstImage.style.display = 'none'
				document.body.insertBefore(firstImage, document.body.firstChild)
				this.videoData.title && (titleEle.innerHTML = this.videoData.title)
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
