interface bit {
	type: string;
	data: number[];
}

export interface LitebansDataA {
	uuid: string;
	name: string;
	reason: string;
	banned_by_name: string;
	removed_by_date: Date;
	time: number;
	until: number;
	ipban: bit;
}

export interface SuccessResponseA {
	success: boolean;
	data: LitebansDataA[];
}

export interface LitebansDataB {
	uuid: string;
	name: string;
	reason: string;
	banned_by_name: string;
	time: number;
	record_count: number;
}

export interface SuccessResponseB {
	success: boolean;
	data: LitebansDataB[];
}

interface kick {
	reason: string;
	reason_count: number;
}

export interface kicks {
	uuid: string;
	name: string;
	kick: kick[];
	kick_count: number;
}

export interface SuccessResponseKicks {
	success: boolean;
	data: kicks[];
}
