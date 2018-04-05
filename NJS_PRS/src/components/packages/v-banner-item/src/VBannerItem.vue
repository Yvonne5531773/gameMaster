<template>
  <div :class="itemClass" :style="itemStyle" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend">
    <a class="download">
      <div class="image">
        <img class="pic" v-lazy="item.img"/>
      </div>
      <div class="banner-label">
        <p class="title">{{item.title}}</p>
      </div>
      <div class="open"></div>
    </a>
  </div>
</template>

<script>
	export default {
		name: 'VBannerItem',
		data () {
			return {
				openTxt: this.$txt.TXT_1
			}
		},
		props: {
			current: {
				type: Boolean
      },
			itemStyle: {
				type: Object
      },
      item: {
				type: Object
      },
			touchstart: {
				type: Function
      },
			touchmove: {
				type: Function
			},
			touchend: {
				type: Function
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
  .slide-item
    float left
    height 100%
    .download
      display -webkit-box
      display -ms-flexbox
      display flex
      position relative
      -webkit-box-orient horizontal
      -webkit-box-direction normal
      -ms-flex-direction row
      flex-direction row
      -webkit-box-pack justify
      -ms-flex-pack justify
      justify-content space-between
      -webkit-box-align center
      -ms-flex-align center
      align-items center
      padding 5px 13px 5px 13px
      height 100%
      -webkit-box-sizing border-box
      box-sizing border-box
      .image
        position relative
        .pic
          height 40px
          min-width 72px
      .banner-label
        margin 0 12px
        -webkit-box-flex 1
        -ms-flex-positive 1
        flex-grow 1
        -ms-flex-item-align start
        align-self flex-start
        p
          color #fff
        .title
          font-size 12px
          line-height 16px
      .open
        border-radius 2px
        text-align center
        font-size 13px
        line-height 24px
        min-width 56px
        height 24px
        color #fff
        background-color #FA1F41
</style>
