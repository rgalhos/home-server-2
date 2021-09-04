export function bytesToSizeString(bytes: number, precision = 1) : string{
	let sizes = [null, 'B', 'KB', 'MB', 'GB', 'TB'];
	let i = 0;

	if (bytes === 0)
		return '0 B';
	// eslint-disable-next-line
	while (i++, bytes > 1000)
		bytes /= (1 << 10);

	return bytes.toFixed(i === 1 ? 0 : precision) + ' ' + sizes[i];
}

export function isOnMobile() {
	let onMobile = false;

	if (navigator?.maxTouchPoints) {
		onMobile = navigator.maxTouchPoints > 0;
	}
	// @ts-ignore
	else if (navigator?.msMaxTouchPoints) {
		// @ts-ignore
		onMobile = navigator.msMaxTouchPoints > 0;
	} else {
		const mq = window?.matchMedia("(pointer:coarse)");

		if (mq?.media === "(pointer:coarse)") {
			onMobile = !!mq.matches;
		} else if (window?.orientation) {
			onMobile = true;
		} else {
			const ua = navigator.userAgent;
			onMobile = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(ua) ||
				/\b(Android|Windows Phone|iPad|iPod)\b/i.test(ua);
		}
	}

	return onMobile;
}
