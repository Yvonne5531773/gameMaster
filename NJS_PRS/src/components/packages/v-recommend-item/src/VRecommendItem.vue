<template>
	<div class="recommend-item">
		<div class="item-top">
			<b class="item-top-left"></b>
			<p class="item-title">{{title}}</p>
			<span class="item-top-right">{{$txt.TXT_9}}</span>
		</div>
		<keep-alive>
			<component :is='current' :data="vm.data"></component>
		</keep-alive>
	</div>
</template>

<script>
	import VWaterfall from './VWaterfall.vue'
	import VRecyclist from './VRecyclist.vue'
	export default {
		name: 'VRecommendItem',
		data () {
			return {
				vm: {
					data: [{
						desc: '神仙打架，透视外挂瞬间爆炸还有谁神仙打架，透视外挂瞬间爆炸还有谁！！！！'
					},{
						desc: '开启伏地魔模式，一路杀进前十，医疗包已备…'
					},{
						desc: '落地成盒需要缘分@！！'
					}]
				},
			}
		},
		props: {
			componentType: {
				type: String
			}
		},
		created () {
			this.init()
		},
		computed: {
			current () {
				return this.componentType
			},
			title () {
				return this.componentType==='VWaterfall'?this.$txt.TXT_8:''
			}
		},
		methods: {
			init () {

			},
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
			line-height .36rem
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
