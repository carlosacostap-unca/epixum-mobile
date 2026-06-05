const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";
const ARGENTINA_UTC_OFFSET_HOURS = -3;

function readDateTimeParts(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dateTimeLocalToArgentinaWallClockIso(value?: string) {
  const parts = readDateTimeParts(value);
  if (!parts) return "";

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}.000Z`;
}

export function parseArgentinaWallClockDate(value?: string) {
  const parts = readDateTimeParts(value);
  if (!parts) return null;

  return new Date(Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour - ARGENTINA_UTC_OFFSET_HOURS,
    parts.minute,
    parts.second,
  ));
}

export function formatArgentinaWallClockDate(value?: string) {
  const date = parseArgentinaWallClockDate(value);
  if (!date || Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(date);
}

export function toArgentinaDateTimeLocalInput(value?: string) {
  const parts = readDateTimeParts(value);
  if (!parts) return "";

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}
