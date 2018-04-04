import VBanner from './packages/v-banner/index.js'
import VBannerItem from './packages/v-banner-item/index.js'

import txt from '../txt/index'
import velocity from 'velocity-animate/velocity.min'
import { websiteApi } from 'api'

const install = function (Vue) {
	if (install.installed) return

	Vue.component(VBanner.name, VBanner)
	Vue.component(VBannerItem.name, VBannerItem)

	Vue.$txt = Vue.prototype.$txt = txt
	Vue.$api = Vue.prototype.$api = websiteApi
	Vue.$velocity = Vue.prototype.$velocity = velocity;
};

export default {
	install
}