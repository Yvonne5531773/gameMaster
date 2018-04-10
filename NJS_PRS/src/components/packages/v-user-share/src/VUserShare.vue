<template>
	<div class="video-user-share" v-if="!isIOS()">
		<span class="avatar">
			<img v-lazy="avatar"/>
		</span>
		<div class="text">
			<p class="name">{{name}}</p>
			{{$txt.TXT_6}}
			<span class="game-master">{{$txt.TXT_7}}</span>
		</div>
		<span @click="open" class="open-btn">{{$txt.TXT_1}}</span>
	</div>
</template>

<script>
	export default {
		name: 'VUserShare',
		computed: {
			avatar () {
				return {
					src: require('assets/img/video/avatar_default.png'),
					error: require('assets/img/video/avatar_default.png'),
					loading: require('assets/img/video/avatar_default.png')
				}
			},
			name () {
				return this.$txt.TXT_5
			}
		},
		methods: {
			open () {
				this.activate()
			}
		}
	}
</script>

<style lang="stylus">
	.video-user-share
		position relative
		margin .28rem .42rem .28rem .42rem
		border-radius .06rem
		background-color #ffffff
		box-shadow 0 0 0.5rem .21rem rgba(0,0,0,0.05)
		height 1.89rem
		.avatar
			position absolute
			left .35rem
			top .35rem
			img
				width 1.22rem
				height 1.22rem
		.text
			display inline-block
			position absolute
			left 1.81rem
			top .49rem
			color #666
			font-size .33rem
			line-height .5rem
			.name
				font-size .39rem
				color #333
			.game-master
				color #009AFF
		.open-btn
			position absolute
			top 0
			right .49rem
			bottom 0
			margin auto
			border-radius .48rem
			text-align center
			color #fafafa
			background-image: linear-gradient(-90deg, #1D50FF 0%, #00C2FF 100%)
			width 2.01rem
			height .81rem
			line-height .85rem
			font-size .39rem
			font-weight 100
</style>
