export interface ReadingRequest {
	meter_id: number;
	production: number;
	consumption: number;
	gas: number;
	date?: string;
}

export interface ReadingResponse {
	id: number;
	meter_id: number;
	date: string;
	production: number;
	consumption: number;
	difference: number;
	gas: number;
}
