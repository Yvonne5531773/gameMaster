<template>
	<div class="recommend-item">
		<div class="item-top">
			<b class="item-top-left"></b>
			<p class="item-title">{{title}}</p>
			<span class="item-top-right" v-if="!isIOS()">{{$txt.TXT_9}}</span>
		</div>
		<keep-alive>
			<component v-if="vm.data" :is='current' :data="vm.data"></component>
		</keep-alive>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import VWaterfall from './VWaterfall.vue'
	import VRecyclist from './VRecyclist.vue'
	import { urls } from 'config/index'
	import { getBrowserName, toQuery } from 'utils/index'
	export default {
		name: 'VRecommendItem',
		data () {
			return {
				vm: {
					data: null
				},
			}
		},
		props: {
			componentType: {
				type: String
			}
		},
		mounted () {
			this.init()
		},
		computed: {
			...mapState(['videoId']),
			current () {
				return this.componentType
			},
			title () {
				return this.componentType==='VWaterfall'?this.$txt.TXT_8:''
			}
		},
		methods: {
			async init () {
				const data = await this.fetchRecommendData()
				_.forEach(data, this.dto)
				this.vm.data = _.cloneDeep(data)
			},
			async fetchRecommendData () {
				const uuid = this.getId('uuid'),
					aid = this.getId('aid'),
					videoId = this.videoId,
					model = getBrowserName(),
					url = urls.recommend + '&' + toQuery({
						uuid: uuid,
						aid: aid,
						contentid: videoId,
						model: model
					})
				let recommendData
				try {
					recommendData = await this.fetch(url)
				} catch (e) {
					console.log('recommend error', e)
				}
				return !_.isEmpty(recommendData)? recommendData.data:[]
			},
			dto (data) {
				const avatar = !_.isEmpty(data.images)? data.images[0] : '',
					desc = data.title || ''
				_.assignIn(data, {
					avatar: avatar,
					desc: desc
				})
			}
		},
		components: {
			VWaterfall,
			VRecyclist,
		}
	}
</script>

<style lang="stylus">
	.recommend-item
		-webkit-margin-after-collapse separate
		-webkit-margin-before-collapse discard
		.item-top
			margin-bottom .28rem
			height .42rem
			line-height .39rem
			.item-top-left
				position absolute
				border-radius 1.39rem
				transform rotate(-180deg)
				width .14rem
				height .36rem
				background #1D50FF
			.item-title
				position absolute
				padding-left .26rem
				font-size .33rem
				color #666
			.item-top-right
				float right
				color #999
				font-size .31rem
</style>
