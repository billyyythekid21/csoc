export function formatEventTime(iso: string): string {
	return new Date(iso).toLocaleString(undefined, {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		hour: 'numeric',
		minute: '2-digit',
	});
}

export function splitTags(value: string | null | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
}

export function displayUrl(url: string): string {
	return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function isWebUrl(value: string): boolean {
	return /^https?:\/\//.test(value);
}

export function joinWords(words: string[]): string {
	if (words.length <= 1) return words.join('');
	return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}
