const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export type SlotItem = { startAt: string; available: boolean };

export type Surgeon = {
  id: number;
  name: string;
  specialization: string;
  startedYear?: number;
};

export async function getSurgeons() {
  const res = await fetch(`${API_BASE}/surgeons`, { cache: 'no-store' });
  if (!res.ok) throw await res.json();
  return res.json() as Promise<Surgeon[]>;
}

export async function getSlots(params: {
  date: string;         // 'YYYY-MM-DD'
  surgeonId: number;
  durationMin?: number;
  stepMin?: number;
  startHour?: number;
  endHour?: number;
}) {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const res = await fetch(`${API_BASE}/slots?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw await res.json();
  return res.json() as Promise<SlotItem[]>;
}

export async function createBooking(body: {
  surgeonId: number;
  startAt: string;      // ISO
  durationMin: number;  // >= 90
  patientName: string;
  patientPhone: string;
  patientDiagnosis?: string;
  bookerName?: string;
  bookerPhone: string;
}) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}