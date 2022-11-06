import { Injectable } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';
import { MIResponse } from '@infor-up/m3-odin/dist/mi/runtime';
import { SohoMessageService, SohoToastService } from 'ids-enterprise-ng';

@Injectable({
   providedIn: 'root'
})
export class NotificationService extends CoreBase {

   constructor(private messageService: SohoMessageService, private toastService: SohoToastService) {
      super('NotificationService');
   }

   public showToastMessage(title: string, message: string, position: SohoToastPosition = SohoToastService.TOP_RIGHT) {
      this.toastService.show({
         draggable: true,
         title: title,
         message: message,
         position: position
      });
   }

   public handleError(title: string, message: string, error?: any) {
      let errorString = '';
      if (error instanceof MIResponse) {
         errorString = " #Error Message: " + error.errorMessage + ", API: " + error.program + "." + error.transaction + ", Error Code: " + error.errorCode;
      } else if (error) {
         errorString = ' #Error: ' + JSON.stringify(error);
      }
      this.logError(message, errorString);
      const buttons = [{ text: 'Ok', click: (e, modal) => { modal.close(); } }];
      this.messageService.error()
         .title(title)
         .message(message + errorString + '. More details might be available in the browser console.')
         .buttons(buttons)
         .open();
   }

   public showAlert(title: string, message: string, object?: any) {
      let objectString = object ? '# Info: ' + JSON.stringify(object) : '';
      const buttons = [{ text: 'Ok', click: (e, modal) => { modal.close(); } }];
      this.messageService.alert()
         .title(title)
         .message(message + objectString)
         .buttons(buttons)
         .open();
   }
}
