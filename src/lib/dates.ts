import { format } from "date-fns";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const todayKey = () => toKey(new Date());
