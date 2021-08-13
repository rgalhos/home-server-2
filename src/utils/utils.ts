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
