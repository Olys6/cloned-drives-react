// Formatting utilities

export const fmtMoney = (n) => '$' + Math.floor(n).toLocaleString();

export const fmtNumber = (n) => n.toLocaleString();

// Short number format (1.2K, 3.4M, etc.)
export const fmtShort = (n) => {
	if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
	if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
	if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
	return n.toString();
};

// Format time in seconds
export const fmtTime = (seconds) => {
	if (seconds < 60) return `${seconds.toFixed(1)}s`;
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}m ${secs.toFixed(0)}s`;
};

// Tyre type abbreviation
export const getTyreAbbr = (tyreType) => {
	const abbrs = {
		'Performance': 'PER',
		'Standard': 'STD',
		'Off-Road': 'OFF',
		'All-Surface': 'ALL',
		'Drag': 'DRG',
		'Slick': 'SLK',
	};
	return abbrs[tyreType] || tyreType;
};
