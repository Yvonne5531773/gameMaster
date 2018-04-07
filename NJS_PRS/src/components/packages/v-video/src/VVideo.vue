<template>
	<section class="video-container">
		<keep-alive>
			<component :is='current'></component>
		</keep-alive>
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
