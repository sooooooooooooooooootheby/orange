export const handleTime = (time) => {
	const date = new Date(time);

	if (isNaN(date.getTime())) {
		throw new Error("Invalid date provided");
	}
	const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
	const beijingTime = new Date(utcTime + 3600000 * 8);

	const pad = (n) => n.toString().padStart(2, "0");

	const yyyy = beijingTime.getUTCFullYear();
	const mm = pad(beijingTime.getUTCMonth() + 1);
	const dd = pad(beijingTime.getUTCDate());
	const hh = pad(beijingTime.getUTCHours());
	const min = pad(beijingTime.getUTCMinutes());

	return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
};
