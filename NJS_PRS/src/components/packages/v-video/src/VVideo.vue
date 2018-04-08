<template>
	<section class="video-container" ref="video">
		<keep-alive>
			<component :is='current'></component>
		</keep-alive>
		<VDownloadBottom></VDownloadBottom>
		<VVideoHeader></VVideoHeader>
		<VUserShare></VUserShare>
	</section>
</template>

<script>
	export default {
		name: 'VVideo',
		data () {
			return {
				vm: {
					components: ['VPlayer', 'VNoPlayer']
				},
			}
		},
		mounted () {

		},
		props: {

		},
		computed: {
			current () {
				return this.vm.components[0]
			}
		},
	}
</script>

<style lang="stylus">
	.video-container
		position relative
		top 0
		left 0
		width 100%
</style>
