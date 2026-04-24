import type { MeterRequest, MeterResponse } from "./meter";
import type { ReadingRequest, ReadingResponse } from "./readings";

export interface MutationResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

export interface WindowApi {
  createMeter: (payload: MeterRequest) => Promise<MutationResult>;
  getMeters: () => Promise<MeterResponse[]>;
  updateMeter: (id: number, payload: MeterRequest) => Promise<MutationResult>;
  deleteMeter: (id: number) => Promise<MutationResult>;
  createReading: (payload: ReadingRequest) => Promise<MutationResult>;
  getReadings: (meterId: number) => Promise<ReadingResponse[]>;
  getReadingsByMeterId: (meterId: number) => Promise<ReadingResponse[]>;
  updateReading: (
    id: number,
    payload: Pick<ReadingRequest, "production" | "consumption" | "gas">
  ) => Promise<MutationResult>;
  deleteReading: (id: number) => Promise<MutationResult>;
}