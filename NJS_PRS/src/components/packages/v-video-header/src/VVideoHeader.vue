<template>
	<div class="video-header">
		<div class="info">
			<div class="title">
				<span>{{vm.title | clip(60)}}</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'VVideoHeader',
		data () {
			return {
				vm: {
					title: '哪位大神告诉我这是怎么了 ？千万里路去和队友汇合,忽然就没了哪位大神告诉我这是怎么了 ？千万里路去和队友汇合,忽然就没了'
				},
			}
		},
		props: {

		},
		created () {
			this.init()
		},
		computed: {

		},
		methods: {
			init () {

			},
		}
	}
</script>

<style lang="stylus">
	.video-header
		height 2.19rem
		font-size .5rem
		color #333
		background #fff
		box-shadow 0 .14rem .33rem 0 rgba(0,0,0,0.05)
		.info
			padding .4rem .69rem .4rem .69rem
			.title
				span
					letter-spacing 0
					line-height .67rem
</style>
