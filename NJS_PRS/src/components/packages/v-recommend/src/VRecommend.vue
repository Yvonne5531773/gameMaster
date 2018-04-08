<template>
	<div class="recommend">
		<VRelated></VRelated>
	</div>
</template>

<script>
	export default {
		name: 'VRecommend',
		data () {
			return {
				vm: {

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
	.recommend
		padding .28rem .42rem
</style>
