'use strict'

export const Api = {
	/**
	 * 设置浏览器启动时打开的页面
	 * @param {number} val 设置值
	 *
	 * @example
	 * setRestoreOnStartup(5) 打开 "新标签" 页
	 * setRestoreOnStartup(1) 恢复上次未关闭的页面
	 * setRestoreOnStartup(6) 打开上次未关闭的页面列表
	 * setRestoreOnStartup(7) 打开收藏管理器
	 * setRestoreOnStartup(8) 打开 "猎豹网址精选"
	 * setRestoreOnStartup(4) 打开主页
	 *
	 * @author CainLi<lizihao@cmcm.com>
	 */
	setRestoreOnStartup(val) {
		if(!val) return
		const obj = {
			popup_view_id: 'restore_on_startup',
			restore_on_startup: val
		}
		external.CallWrapper && external.CallWrapper('website', JSON.stringify(obj))
	}
}


