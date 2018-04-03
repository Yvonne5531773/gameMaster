<template>
  <div :class="itemClass">

  </div>
</template>

<script>
	export default {
		name: 'VBannerItem',
		data () {
			return {

			}
		},
		props: {
			current: {
				type: Boolean
      }
		},
		computed: {
			itemClass () {
				return this.current? 'slide-item current' : 'slide-item'
      }
		},
		mounted () {

		},
		methods: {

		}
	}
</script>

<style lang="stylus">

</style>
