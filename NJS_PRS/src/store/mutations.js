import {
	SET_COMPONENT,
	SET_VIDEO_ID,
} from './mutation-types.js'

export default {
	[SET_COMPONENT] (state, {
		component,
	}) {
		state.component = component;
	},

	[SET_VIDEO_ID] (state, {
		videoId,
	}) {
		state.videoId = videoId;
	},
}
