<template>
  <div :class="itemClass" :style="itemStyle" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend">
    <a class="download">
      <div class="image" :style="!item.first&&'paddingLeft:.21rem'">
        <img :class="{'first':item.first, 'pic':!item.first}" :style="!item.img&&`backgroundColor:#d8d8d8`" :src="item.img"/>
      </div>
      <div class="banner-label">
        <p class="title" v-if="!item.first">{{item.title}}</p>
        <img class="game-master-txt-pic" :src="gameMasterTxtPic" v-else/>
      </div>
      <img class="bg-pic" :src="bgPic" v-if="item.first"/>
      <div class="open">{{openTxt}}</div>
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
      },
      gameMasterTxtPic () {
				return require('assets/img/banner/game-master.png')
      },
      bgPic () {
				return require('assets/img/banner/game-master-bg.png')
      }
		},
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
      /*padding .18rem .18rem .07rem .18rem*/
      height 100%
      -webkit-box-sizing border-box
      box-sizing border-box
      .image
        position relative
        padding-top .13rem
        .pic
          height 1.22rem
          min-width 1.97rem
        .first
          min-width 1.39rem
          height 1.39rem
      .banner-label
        margin 0 .7rem 0 .35rem
        -webkit-box-flex 1
        -ms-flex-positive 1
        flex-grow 1
        -ms-flex-item-align start
        align-self flex-start
        p
          color #fff
        .title
          font-size .33rem
          line-height .9rem
        .game-master-txt-pic
          position relative
          right .44rem
          top .08rem
          width 2.17rem
          height .51rem
      .open
        margin-right .35rem
        border-radius 1.39rem
        text-align center
        font-size .33rem
        line-height .66rem
        min-width 1.33rem
        height .61rem
        color #176AFF
        background-color #fff
        box-shadow:0 .03rem .33rem 0 rgba(0,0,0,0.27)
      .bg-pic
        position absolute
        width 100%
        z-index -1
</style>
