<template>
  <div :class="itemClass" :style="itemStyle">
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
    [data-dpr="2"] .download
      padding 10px 26px 10px 26px
    [data-dpr="3"] .download
      padding 15px 39px 15px 39px
      .image
        position relative
        .pic
          height 40px
          min-width 72px
        [data-dpr="2"] .pic
          height 80px
          min-width 144px
        [data-dpr="3"] .pic
          height 120px
          min-width 216px
      .banner-label
        margin 0 12px
        -webkit-box-flex 1
        -ms-flex-positive 1
        flex-grow 1
        -ms-flex-item-align start
        align-self flex-start
      [data-dpr="2"] .banner-label
        margin 0 24px
      [data-dpr="3"] .banner-label
        margin 0 36px
        p
          color #fff
        .title
          font-size 12px
          line-height 16px
        [data-dpr="2"] .title
          font-size 24px
          line-height 32px
        [data-dpr="3"] .title
          font-size 36px
          line-height 48px
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
