export const formatTimeRemaining = (time: number, until: number) => {
	const diff = until - time;

	if (diff <= 0) {
		return "已过期" + diff;
	}

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (years > 0) {
		return `${years}年`;
	} else if (months > 0) {
		return `${months}个月`;
	} else if (days > 0) {
		return `${days}天`;
	} else if (hours > 0) {
		return `${hours}小时`;
	} else if (minutes > 0) {
		return `${minutes}分钟`;
	} else {
		return `${seconds}秒`;
	}
};
