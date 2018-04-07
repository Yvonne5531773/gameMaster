import VBanner from './packages/v-banner/index.js'
import VBannerItem from './packages/v-banner-item/index.js'
import VVideo from './packages/v-video/index.js'
import VPlayer from './packages/v-player/index.js'
import VNoPlayer from './packages/v-no-player/index.js'
import VMask from './packages/v-mask/index.js'

import ua from '../ua/index'
import txt from '../txt/index'
import velocity from 'velocity-animate/velocity.min'
import { websiteApi } from 'api'

const install = function (Vue) {
	if (install.installed) return

	Vue.component(VBanner.name, VBanner)
	Vue.component(VBannerItem.name, VBannerItem)
	Vue.component(VVideo.name, VVideo)
	Vue.component(VPlayer.name, VPlayer)
	Vue.component(VNoPlayer.name, VNoPlayer)
	Vue.component(VMask.name, VMask)

	Vue.$ua = Vue.prototype.$ua = ua
	Vue.$txt = Vue.prototype.$txt = txt
	Vue.$api = Vue.prototype.$api = websiteApi
	Vue.$velocity = Vue.prototype.$velocity = velocity;
};

export default {
	install
}