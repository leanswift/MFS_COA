import { Injectable } from '@angular/core';
import { UserService } from '@infor-up/m3-odin-angular';
import { IUserContext, Log } from '@infor-up/m3-odin';
import { MIUtil } from '@infor-up/m3-odin/dist/mi/runtime';
import { Observable } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
/**
 * The UserContextService contains m3 user context related methods
 */
export class UserContextService {

   userContext: IUserContext;

   constructor(private userService: UserService) {
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {
         this.userContext = userContext;
      });
   }

   /**
    * Returns the usercontext as an observable
    */
   getUserContext(): Observable<IUserContext> {
      return this.userService.getUserContext();
   }

   /**
    * Returns the usercontext as a promise
    */
   async getUserContextAsPromise(): Promise<IUserContext> {
      return this.userService.getUserContext().toPromise();
   }

   /**
    * Takes the usercontext dateformat (DTFM) and returns it in an xx/yy/zz format. Used
    * to initialize the date format for Soho datepickers
    */
   getDateFormat(): string {
      let dateFormat: string;
      const dtfm = this.userContext.DTFM;
      switch (dtfm) {
         case "YMD":
            dateFormat = "yy/MM/dd";
            break;
         case "MDY":
            dateFormat = "MM/dd/yy";
            break;
         case "DMY":
            dateFormat = "dd/MM/yy";
            break;
         default:
            dateFormat = "yy/MM/dd";
      }
      return dateFormat;
   }

   /**
    * Takes a date string as input (in the user's dateformat) and returns a date object
    * @param date
    */
   getDate(date: string): Date {
      try {
         let year: number;
         let month: number;
         let day: number;
         const dtfm = this.userContext.DTFM;
         switch (dtfm) {
            case "YMD":
               year = parseInt("20" + date.substr(0, 2));
               month = parseInt(date.substr(3, 2)) - 1;
               day = parseInt(date.substr(6, 2));
               break;
            case "MDY":
               year = parseInt("20" + date.substr(6, 2));
               month = parseInt(date.substr(0, 2)) - 1;
               day = parseInt(date.substr(3, 2));
               break;
            case "DMY":
               year = parseInt("20" + date.substr(6, 2));
               month = parseInt(date.substr(3, 2)) - 1;
               day = parseInt(date.substr(0, 2));
               break;
         }
         return new Date(year, month, day);
      } catch (err) {
         Log.debug(err);
         return null;
      }
   }

   /**
    * Takes a date string as input (in the user's dateformat) and returns a date string in
    * yyyyMMdd format
    * @param date
    */
   getDateFormatted(date: string): string {
      try {
         let year: number;
         let month: number;
         let day: number;
         const dtfm = this.userContext.DTFM;
         switch (dtfm) {
            case "YMD":
               year = parseInt("20" + date.substr(0, 2));
               month = parseInt(date.substr(3, 2)) - 1;
               day = parseInt(date.substr(6, 2));
               break;
            case "MDY":
               year = parseInt("20" + date.substr(6, 2));
               month = parseInt(date.substr(0, 2)) - 1;
               day = parseInt(date.substr(3, 2));
               break;
            case "DMY":
               year = parseInt("20" + date.substr(6, 2));
               month = parseInt(date.substr(3, 2)) - 1;
               day = parseInt(date.substr(0, 2));
               break;
         }
         return MIUtil.getDateFormatted(new Date(year, month, day));
      } catch (err) {
         Log.debug(err);
         return null;
      }
   }

   getDateFormattedForEnterpriseSearch(date: string): string {
      try {
         let yearString: string;
         let monthString: string;
         let dayString: string;
         let dateString: string;
         const dtfm = this.userContext.DTFM;
         switch (dtfm) {
            case "YMD":
               yearString = date.substr(0, 2);
               monthString = date.substr(3, 2);
               dayString = date.substr(6, 2);
               break;
            case "MDY":
               yearString = date.substr(6, 2);
               monthString = date.substr(0, 2);
               dayString = date.substr(3, 2);
               break;
            case "DMY":
               yearString = date.substr(6, 2);
               monthString = date.substr(3, 2);
               dayString = date.substr(0, 2);
               break;
         }
         monthString = monthString.length < 2 ? "0" + monthString : monthString;
         switch (dtfm) {
            case "YMD":
               dateString = yearString + monthString + dayString;
               break;
            case "MDY":
               dateString = monthString + dayString + yearString;
               break;
            case "DMY":
               dateString = dayString + monthString + yearString;
               break;
         }
         return dateString;
      } catch (err) {
         Log.debug(err);
         return null;
      }
   }

   getDateFormattedForDatepicker(date: Date): string {
      let year: number;
      let month: number;
      let day: number;
      let yearString: string;
      let monthString: string;
      let dayString: string;
      let dateString: string;

      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();

      yearString = (year - 2000).toString();
      monthString = month.toString();
      monthString = month < 10 ? "0" + monthString : monthString;
      dayString = day.toString();
      dayString = day < 10 ? "0" + dayString : dayString;

      const dtfm = this.userContext.DTFM;
      switch (dtfm) {
         case "YMD":
            dateString = yearString + "/" + monthString + "/" + dayString;
            break;
         case "MDY":
            dateString = monthString + "/" + dayString + "/" + yearString;
            break;
         case "DMY":
            dateString = dayString + "/" + monthString + "/" + yearString;
            break;
      }
      return dateString;
   }
}
