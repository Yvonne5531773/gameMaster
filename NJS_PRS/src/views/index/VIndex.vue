<template>
	<div class='index' ref="index">
		<VBanner></VBanner>
		<VVideo></VVideo>
		<VRecommend></VRecommend>
		<VBottom></VBottom>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	export default {
		data() {
			return {

			}
		},
		watch: {
			component () {
				this.init()
			},
		},
		mounted () {
			this.init()
		},
		computed:{

		},
		methods: {
			init () {

			},
		},
	}
</script>

<style lang='stylus' scoped>
	.index
		position absolute
		margin 0
		padding 0
		border 0
		width 100%
		height 100%
		-webkit-box-orient vertical
		-webkit-box-direction normal
		-ms-flex-direction column
		flex-direction column
		-webkit-box-align stretch
		-ms-flex-align stretch
		align-items stretch
		-ms-flex-negative 0
		flex-shrink 0
</style>