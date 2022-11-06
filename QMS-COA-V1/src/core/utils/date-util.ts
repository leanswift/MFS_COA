import { MIUtil } from "@infor-up/m3-odin/dist/mi/runtime";

export class DateUtil {

  static getDifferenceInDays(dateFrom: Date | string, dateTo: Date | string): number {
    dateTo = typeof dateTo === 'string' ? MIUtil.getDate(dateTo) : dateTo;
    dateFrom = typeof dateFrom === 'string' ? MIUtil.getDate(dateFrom) : dateFrom;
    return Math.floor((dateFrom.getTime() - dateTo.getTime()) / 86400000);
  }

  static getDifferenceInMonths(dateTo: Date | string, dateFrom: Date | string): number {
    dateTo = typeof dateTo === 'string' ? MIUtil.getDate(dateTo) : dateTo;
    dateFrom = typeof dateFrom === 'string' ? MIUtil.getDate(dateFrom) : dateFrom;
    return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
  }
}
