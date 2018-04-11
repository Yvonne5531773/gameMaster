<template>
	<div class="video-download-bottom" v-if="!isIOS()">
		<div @click="open" class="video-download-banner">
			<span>{{$txt.TXT_2}}</span>
			<img :src="vm.arrowSrc" />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'VDownloadBottom',
		data () {
			return {
				vm: {
					arrowSrc: require('assets/img/video/arrow.png'),
				},
			}
		},
		methods: {
			open () {
				this.activate()
				this.report({action: 6})
			}
		}
	}
</script>

<style lang="stylus">
	.video-download-bottom
		background-image -webkit-gradient(linear, left top, right top, from(#009AFF), to(#009AFF))
		background-image linear-gradient(to right, #009AFF, #009AFF)
		.video-download-banner
			position relative
			text-align center
			font-size .39rem
			color #fff
			height 1rem
			line-height 1rem
			background-color #009AFF
			img
				padding-left .14rem
				position relative
				top 0
				vertical-align middle
				height .32rem

</style>
