import { contextBridge, ipcRenderer } from "electron";
import type { WindowApi } from "../types/api";

const api: WindowApi = {
	createMeter: (payload) => ipcRenderer.invoke("meter:create", payload),
	getMeters: () => ipcRenderer.invoke("meter:list"),
	updateMeter: (id, payload) => ipcRenderer.invoke("meter:update", id, payload),
	deleteMeter: (id) => ipcRenderer.invoke("meter:delete", id),
	createReading: (payload) => ipcRenderer.invoke("reading:create", payload),
	getReadings: (meterId) => ipcRenderer.invoke("reading:list", meterId),
	getReadingsByMeterId: (meterId) => ipcRenderer.invoke("reading:listByMeterId", meterId),
	updateReading: (id, payload) => ipcRenderer.invoke("reading:update", id, payload),
	deleteReading: (id) => ipcRenderer.invoke("reading:delete", id),
};

contextBridge.exposeInMainWorld("api", api);
