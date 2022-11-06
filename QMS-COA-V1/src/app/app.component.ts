import { Component, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { CoreBase, IIonApiRequest, IIonApiResponse, IMIRequest, IUserContext } from '@infor-up/m3-odin';
import { IonApiService, MIService, UserService } from '@infor-up/m3-odin-angular';
import { SohoDataGridComponent, SohoPersonalizeDirective, SohoRenderLoopService, SohoApplicationMenuComponent } from 'ids-enterprise-ng';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from 'src/core/services/notification.service';

// import {
//    SohoDataGridComponent

// } from 'ids-enterprise-ng';

interface ThemeMenuItem extends SohoTheme {
   selected?: boolean;
}

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent extends CoreBase implements OnInit {

   private static IS_APPLICATION_MENU_OPEN_KEY = 'is-application-menu-open';
   /**
   * Application Header Title
   */
   readonly headerTitle = "QMS-COA";
   @ViewChild(SohoApplicationMenuComponent, { static: true })
   public applicationMenu?: SohoApplicationMenuComponent;
   @ViewChild(SohoPersonalizeDirective, { static: true }) personalize?: SohoPersonalizeDirective;
   @HostBinding('class.no-scroll') get isNoScroll() {
      return true;
   }

   userContext = {} as IUserContext;
   isBusy = false;
   company: string;
   itemnumber: string;
   email: string;
   seqrid: string;
   sebano: string;
   rorc: string;
   currentCompany: string;
   division: string;
   currentDivision: string;
   language: string;
   currentLanguage: string;
   colotnumber: string;
   notes1: string;
   notes2: string;
   notes3: string;
   notes4: string;
   notes5: string;
   tempqtest: string;
   idmxml: string;
   ItdsEditablevalue: string;
   itemBasicData: {
      QTRS: '',
      QLCD: '',
      QTST: ''
    };
  


   @ViewChild('itemModalDatagrid') itemModalDatagrid: SohoDataGridComponent;
   itemModalGridOptions: SohoDataGridOptions;
   isItemModalBusy: boolean = false;

   maxRecords = 10000;
   pageSize = 10;
   selectedItem = [];

   @Input() lookupValue: any;
   exceldataWarehouse?: any;
   itemModalData?: any = [];
   selectedInvItems?: any = [];
   excellistWareHouseData: any = [];
   testListData: any = [];
   exportlistData: any = [];

    public themeMenuItems?: ThemeMenuItem[];

   public useUpliftIcons = false;
   public personalizeOptions: SohoPersonalizeOptions = {};

   // private readonly IDS_ENTERPRISE_THEME_KEY = 'ids_theme';
   // private readonly IDS_ENTERPRISE_COLOR_KEY = 'ids_color';

   // private readonly DEFAULT_THEME = 'theme-soho-light';


   // public get theme(): string {
   //    const theme = localStorage.getItem(this.IDS_ENTERPRISE_THEME_KEY);
   //    return theme ? theme : this.DEFAULT_THEME;
   // }




   constructor(private miService: MIService,private ionApiService: IonApiService,private notificationService: NotificationService,private http: HttpClient ,private userService: UserService, private readonly renderLoop: SohoRenderLoopService) {

   // constructor(private miService: MIService, private userService: UserService, private readonly renderLoop: SohoRenderLoopService) {

      super('AppComponent');
   }

   ngOnInit(): void {
      this.initialModalData();
      this.testListData = [];
      this.logInfo('onClickLoad');
      // this.setBusy(true);
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {
         // this.setBusy(false);
         this.logInfo('onClickLoad: Received user context');
         this.userContext = userContext;
         this.updateUserValues(userContext);
      }, (error) => {
         // this.setBusy(false);
         this.logError('Unable to get userContext ' + error);
      });
   }

   
   async initialModalData() {
      
      await this.initItemModalLineGrid();
      await this.loadItemModalData();
   }

   async loadItemModalData() {
      this.setBusy('itemModalData', true);
      this.itemModalData = [];
      this.testListData = [];
      // let term_temp = '((ITNO:' + this.lookupValue + '*) OR (ITNO:' + this.lookupValue + ') OR (ITDS:' + this.lookupValue + '*) OR (ITDS:' + this.lookupValue + '))';
      let inputRecord_item = {
         FACI : "PBG"
      };

      const request_item: IMIRequest = {
         program: 'QMS300MI',
         transaction: 'LstQIRequest',
         record: 
         {
            FACI:'PBG'
         },
         outputFields: ['QRID', 'ITNO', 'BANO', 'QSTA', 'QRDT', 'RORC', 'RORN', 'QAPR', 'QRRP', 'TXID', 'RORX', 'WHLO', 'WHSL', 'CAMU', 'RIDI', 'REPN', 'RELI'],
         maxReturnedRecords: this.maxRecords
      };
      await this.miService.execute(request_item)
         .toPromise()
         .then((response: any) => {
            let getItemData = response.items;
            // getItemData = getItemData.filter( it => {    // Changes For MFS-403 /9082022
            //    return it.RORC.includes("1");});
               getItemData = getItemData.filter( it => {
                  return it.QSTA.includes("3");});

            getItemData.forEach((item: any) => {
               this.itemModalData.push({ 'QRID' : item.QRID,'ITNO': item.ITNO, 'BANO': item.BANO, 'QSTA': "3 - Completed", 'QRDT': item.QRDT, 'RORN': item.RORN, 'RORC': item.RORC == 1 ? "Manufactured" : "Purchased"});
            });
         })
         .catch(function (error) {
            console.log("Item Data Error", error.errorMessage);
         });
      console.log(this.itemModalData);
      
      this.itemModalDatagrid.toolbar = { 'title': '', actions: true, results: true, personalize: true, exportToExcel: true };
      this.updateItemModalList();
      this.setBusy('itemModalData', false);
   }

   async updatecoa(){
      this.isBusy = true;
      var itno = this.itemnumber;
      var qrid = this.seqrid;
      var bano = this.sebano;
      var temp_qse1 ="";
      var idstemp = $('#di-cono').val();

      const request_Export: IMIRequest = {
         program: 'EXPORTMI',
         transaction: 'Select',
         record: {
            SEPC:',', HDRS : '0', QERY: 'RTQRID, RTEVTG, RTAVTG, RTQTST, RTTSTY, RTQTE1, RTQLCD, RTEVMX, RTEVMN, RTSPEC, RTTX40,RTQTRS from QMSRQT where RTQRID = '+qrid
         },
         outputFields: ['REPL'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request_Export)
      .toPromise()
      .then(async (response: any) => {
         let exportList = response.items;
         for (const item of exportList){  
            var chars = item.REPL.split(',');
            this.exportlistData.push({ 'QRID': chars[0], 'EVTG': chars[1], 'AVTG': chars[2], 'QTST': chars[3], 'TSTY': chars[4], 'QTE1': chars[5], 'QLCD': chars[6], 'EVMX': chars[7], 'EVMN': chars[8], 'SPEC': chars[9], 'TX40': chars[10], 'QTRS': chars[11]});
            //this.exportlistData.push(item);
         }           
      });

      
      // this.setBusy('itemModalData', true);

      let inputRecord_item_QTRS = {
         FACI : 'PBG',
         QRID : qrid
      };

      const request_qtrs: IMIRequest = {
         program: 'QMS400MI',
         transaction: 'LstTestResults',
         record: {
            FACI:'PBG', QRID : qrid
         },
         outputFields: ['QTRS','QLCD','QTST'],
         maxReturnedRecords: this.maxRecords
      };

      await this.miService.execute(request_qtrs)
      .toPromise()
      .then(async (response: any) => {
         let getItemDataQse1 = response.items;
         for (const item of getItemDataQse1){  
            this.testListData.push(item);
         }           
      });

      let inputRecord_item_Qse1 = {
         SPEC : itno,
         ITNO : itno
      };

      const request_qse1: IMIRequest = {
         program: 'QMS200MI',
         transaction: 'LstSpec',
         record: inputRecord_item_Qse1,
         outputFields: ['QSE1','SPEC','ITNO'],
         maxReturnedRecords: this.maxRecords
      };
      await this.miService.execute(request_qse1)
      .toPromise()
      .then(async (response: any) => {
         let getItemDataQse1 = response.items;
         var tempItemData1 = getItemDataQse1.filter( it => {
                           return it.SPEC === this.itemnumber });

                           temp_qse1 = tempItemData1[0].QSE1;                 
      });

      let inputRecord_item = {
         SPEC : this.itemnumber,
         QSE1 : temp_qse1,
         ITNO : this.itemnumber
      };

      const request_item: IMIRequest = {
         program: 'QMS201MI',
         transaction: 'LstSpecTest',
         record: inputRecord_item,
         outputFields: ['QTST', 'TSTY', 'QTE1', 'TX40', 'QLCD', 'EVMX', 'EVMN', 'EVTG', 'AVTG'],
         maxReturnedRecords: this.maxRecords
      };

      var date=new Date();
      this.idmxml = "<Root><CustomPrinterFile><PrinterData><value id=" + "\"PRTF\"" + ">COA_PRT</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"USID\"" + ">SHISUB82</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"TIME\"" + ">"+ date +"</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"RGDT\"" + ">20211115</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"RGTM\"" + ">20211115</value>";
      this.idmxml = this.idmxml + "</PrinterData><HeaderInfo>";

     

      this.idmxml = this.idmxml + "<value id=" + "\"ITDS\"" + ">" + (!this.ItdsEditablevalue ? $('#di-cono').val() : this.ItdsEditablevalue) + "</value>";
      // this.idmxml = this.idmxml + "<value id=" + "\"BANO\"" + ">" + this.sebano + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"BANO\"" + ">" + this.colotnumber + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"LTFR\"" + ">" + "20" + this.sebano.substring(0,2)+ "-" + this.sebano.substring(2,4) + "-" + this.sebano.substring(4,6) + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"MFDT\"" + ">" + "20" + this.sebano.substring(0,2)+ "-" + this.sebano.substring(2,4) + "-" + this.sebano.substring(4,6) + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"Notes1\"" + ">" + (!this.notes1 ? '' : this.notes1) + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"Notes2\"" + ">" + (!this.notes2 ? '' : this.notes2)  + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"Notes3\"" + ">" + (!this.notes3 ? '' : this.notes3) + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"Notes4\"" + ">" + (!this.notes4 ? '' : this.notes4) + "</value>";
      this.idmxml = this.idmxml + "<value id=" + "\"Notes5\"" + ">" + (!this.notes5 ? '' : this.notes5) + "</value>";
      this.idmxml = this.idmxml + "</HeaderInfo><LineInfo>"
      // await this.miService.execute(request_item)
      //    .toPromise()
      //    .then(async (response: any) => {
      //       let getItemData = response.items;
          
            for (const item of this.exportlistData){

               this.idmxml = this.idmxml + "<Line>";
            
               // this.idmxml = this.idmxml + "<value id=" + "\"TX40\"" + ">" + (item.TX40.includes("<") == true ? item.TX40.replace("<", "Less Than") : item.TX40) + "</value>";
               this.idmxml = this.idmxml + "<value id=" + "\"TX40\"" + ">" + item.TX40.replace("<", "Less Than") + "</value>";

               var thstas = this.testListData;
               
               if(item.TSTY == 2){
                  this.idmxml = this.idmxml + "<value id=" + "\"LQLC\"" + ">" + "CONFORMS" + "</value>";
                  // // for (const itemtesting of this.testListData){

                     if(item.QTST == item.QTST){
                        if(item.QLCD == ""){
                           this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + parseFloat(item.QTRS).toFixed(3).slice(0,-1) + "</value>";
                           //break;
                        }
                        else{
                           this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + item.QLCD + "</value>";
                           //break;
                        }
                     }
   
                  // // }
                  // // this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + "CONFORMS" + "</value>";
               }
               else{
                  
                  this.idmxml = this.idmxml + "<value id=" + "\"LQLC\"" + ">" + parseFloat(item.EVMN).toFixed(3).slice(0,-1) + " - " + parseFloat(item.EVMX).toFixed(3).slice(0,-1) + "</value>";
                  //for (const itemtesting of this.testListData){

                     if(item.QTST == item.QTST){
                        if(item.QLCD == ""){
                           console.log(parseFloat(item.QTRS).toFixed(3).slice(0,-1));
                           this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + parseFloat(item.QTRS).toFixed(3).slice(0,-1) + "</value>";
                           //break;
                        }
                        else{
                           this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + item.QLCD + "</value>";
                           //break;
                        }
                     }
   
                  //}
               }
          
            // for (const item of getItemData){

            //    this.idmxml = this.idmxml + "<Line>";
            
            //    // this.idmxml = this.idmxml + "<value id=" + "\"TX40\"" + ">" + (item.TX40.includes("<") == true ? item.TX40.replace("<", "Less Than") : item.TX40) + "</value>";
            //    this.idmxml = this.idmxml + "<value id=" + "\"TX40\"" + ">" + item.TX40.replace("<", "Less Than") + "</value>";

            //    var thstas = this.testListData;
               
            //    if(item.TSTY == 2){
            //       this.idmxml = this.idmxml + "<value id=" + "\"LQLC\"" + ">" + "CONFORMS" + "</value>";
            //       for (const itemtesting of this.testListData){

            //          if(item.QTST == itemtesting.QTST){
            //             if(itemtesting.QLCD == ""){
            //                this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + parseFloat(itemtesting.QTRS).toFixed(3).slice(0,-1) + "</value>";
            //                break;
            //             }
            //             else{
            //                this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + itemtesting.QLCD + "</value>";
            //                break;
            //             }
            //          }
   
            //       }
            //       // // this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + "CONFORMS" + "</value>";
            //    }
            //    else{
                  
            //       this.idmxml = this.idmxml + "<value id=" + "\"LQLC\"" + ">" + parseFloat(item.EVMN).toFixed(2) + " - " + parseFloat(item.EVMX).toFixed(2) + "</value>";
            //       for (const itemtesting of this.testListData){

            //          if(item.QTST == itemtesting.QTST){
            //             if(itemtesting.QLCD == ""){
            //                console.log(parseFloat(itemtesting.QTRS).toFixed(3).slice(0,-1));
            //                this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + parseFloat(itemtesting.QTRS).toFixed(3).slice(0,-1) + "</value>";
            //                break;
            //             }
            //             else{
            //                this.idmxml = this.idmxml + "<value id=" + "\"SQLC\"" + ">" + itemtesting.QLCD + "</value>";
            //                break;
            //             }
            //          }
   
            //       }
            //    }

             


               this.idmxml = this.idmxml + "</Line>";
            }
           
           
                           

           
            this.idmxml = this.idmxml + "</LineInfo></CustomPrinterFile></Root>"
            var xml = this.idmxml;
            debugger;
            // var dataXml = btoa(xml);
            var dataXml = btoa(unescape(encodeURIComponent(xml)));  // Special Character issue
            console.log(dataXml);
            const input = {
               "input": [
                  {
                     "type": "generate",
                     "filename": "COA.pdf",
                     "data": {
                        "type": "data",
                        "filename": "COA.xml",
                        "base64": dataXml
                     },
                     "template": {
                        "type": "priority",
                        "priority": [
                           {
                              "type": "template",
                              "templateEntityName": "COA",
                              "templateName": "COA"
                           }
                        ]
                     },
                     "isPdfA": false
                  }
               ],
               "targets": [
                  {
                     "type": "email",
                     "to": this.email,
                     // "to": "noreply@masterchemical.com",
                     "subject": "COA",
                     "body": "",
                     // "from": "subbiaah.kumar@leanswift.com"
                     "from": "noreply@masterchemical.com"
                  }
               ],
               "largeJob": false
            };
            const data = JSON.stringify(input);
            console.log(data);
            const url = 'IDM/api/distribution/v1/submit';
            const request: IIonApiRequest = {
            method: 'POST',
            url,
            body: data,
            headers: { 'content-type': 'application/json;charset=utf-8' },
            source: 'idmAPI'
            };
            // const request = this.createRequestsIDM('', url);
            this.ionApiService.execute(request).subscribe((response: IIonApiResponse) => {
            }, (responses: IIonApiResponse) => {
               // tslint:disable-next-line:max-line-length
               this.notificationService.handleError('IDM API', 'Failed to load the IDM request', responses);
            });
            // this.ionApiService.execute(request).subscribe((response: IIonApiResponse) => {
            // }, (responses: IIonApiResponse) => {
            //    tslint:disable-next-line:max-line-length
            //    this.notificationService.handleError('IDM API', 'Failed to load the IDM request', responses);
            // });
         // // // // })
         // // // // .catch(function (error) {
         // // // //    console.log("Item Data Error", error.errorMessage);
         // // // //    this.isBusy = false;
         // // // // });

         
         this.isBusy = false;
         this.clearExcelAll();
      // var bano = this.
   }

   onSelectedChainItem(event: any) {
      // let chainData = event.target.value;
      this.ItdsEditablevalue = event.target.value;
      // let chainFilter = this.listChainsData.filter((item: any) => item.CUNO === chainData);
      // if (chainFilter.length > 0) {
      //    this.selectedChainCUNO = chainFilter[0].CUNO;
      //    this.selectedChainCUNM = chainFilter[0].CUNM;
      // }
   }

   clearExcelAll() {
      this.exceldataWarehouse = null;
      this.company = null;
      this.notes1 = null;
      this.notes2 = null;
      this.notes3 = null;
      this.notes4 = null;
      this.notes5 = null;
      this.colotnumber = null;
      this.initialModalData();
      this.ItdsEditablevalue = null;
      this.exportlistData = [];
      // this.initItemModalLineGrid();
      // this.loadItemModalData();
      // this.exceldataOrderType = null;
      // this.exceldataWarehouse = null;
      // this.exceldataDeliveryDate = null;
      // this.exceldataSalesRep = null;
      // this.exceldataCustomer = null;
      // this.exceldatatempCustomer = null;
      // this.exceldatatempSalesRep = null;
      // this.fileupload.clearUploadFile();
      // this.itemText1 = null;
      // this.excelDataArr = [];
      // this.lookupValue = "";
      // this.updateExcelGrid();
   }

   public onChangeTheme(ev: SohoChangeThemePersonalizeEvent) {
      const themeId = ev.data.theme;
      // this.theme = themeId;
      this.setSelectedTheme(themeId);
   }

   setSelectedTheme(themeId: string) {
      // Make sure only the current theme is marked as selected.
      this.themeMenuItems?.forEach((theme) => {
         theme.selected = (theme.id === themeId);
      });
   }

  

   updateItemModalList() {
      this.itemModalDatagrid ? this.itemModalDatagrid.dataset = this.itemModalData : this.itemModalDatagrid.dataset = this.itemModalData;
   }

   public async onSelectedInvItem(args: any) {
      this.isBusy = true;
      console.log("selected");
      this.excellistWareHouseData = [];
      if(args.rows.length != 0   )
      {
      const inputRecord_head1 = {
         ITNO: args.rows[0].data.ITNO }; 

      const request_head1: IMIRequest = {
         program: 'MMS200MI',
         transaction: 'GetItmBasic',
         record: inputRecord_head1,
         outputFields: ['ITNO', 'ITDS']
      };

             await this.miService.execute(request_head1).toPromise().then(async (response: any) => {
               this.company = response.items[0].ITDS;
             })
      this.itemnumber = args.rows[0].data.ITNO;
      this.seqrid = args.rows[0].data.QRID;
      this.sebano = args.rows[0].data.BANO;
      this.rorc = args.rows[0].data.RORC;
      this.ItdsEditablevalue = "";
      if(this.rorc === 'Purchased'){
         this.ItdsEditablevalue = this.itemnumber;
      }
      const inputRecord_head = {
         PKFI: args.rows[0].data.ITNO };

      const request_head: IMIRequest = {
         program: 'MMS023MI',
         transaction: 'LstItemPack',
         // record: inputRecord_head,
         outputFields: ['ITNO', 'PKFI'],
         maxReturnedRecords: this.maxRecords
		};

      await this.miService.execute(request_head)
      .toPromise()
      .then(async (response: any) => {
         let getORNOData = response.items;

         getORNOData = getORNOData.filter( it => {
            return it.PKFI.includes(args.rows[0].data.ITNO);});

         // let ornoValue = getORNOData.ITNO;
         //  this.excellistWareHouseData = response.items;
         // getORNOData.forEach((item: any) => {

           
            // for await (const item of getORNOData) {
            for (const item of getORNOData) {

               const inputRecord_head1 = {
                  ITNO: item.ITNO }; 

               const request_head1: IMIRequest = {
                  program: 'MMS200MI',
                  transaction: 'GetItmBasic',
                  record: inputRecord_head1,
                  outputFields: ['ITNO', 'ITDS']
               };

                      await this.miService.execute(request_head1).toPromise().then(async (response: any) => {
                        this.excellistWareHouseData.push(response.items[0]);
                      })
                      
                  // .toPromise()
                  //     .then(async (response: any) => {
                  //       this.excellistWareHouseData.push(response.item);
                  //       // this.excellistWareHouseData = response.item;

                  //  )};

            }
            this.isBusy = false;


         //    const request_head1: IMIRequest = {
         //       program: 'MMS200MI',
         //       transaction: 'GetItmBasic',
         //       record: inputRecord_head,
         //       outputFields: ['ITNO', 'ITDS']
         //    };

         //    //  await this.miService.execute(request_head1)
         //    // .toPromise()
         //    // .then(async (response: any) => {

         //    // )}.catch(function (error) {
         //    //    console.log("Add Batch Head Error", error.errorMessage);
         //    // });
         // }
           
            

            // this.excellistWareHouseData.push({ 'ITNO': item.ITNO, 'ITDS': item.ITDS, 'STAT': item.STAT, 'ITTY': item.ITTY, 'ITGR': item.ITGR });
          
         // console.log(ornoValue);
         // for await (const itemOrder of item.ORDER) {
         //    let inputRecord_line = {
         //       ITNO: itemOrder.ITNO
               
         //    };
         //    if (itemOrder.ALUN) {
         //       inputRecord_line['ALUN'] = itemOrder.ALUN;
         //    }
         //    if (itemOrder.SAPR) {
         //       inputRecord_line['SAPR'] = itemOrder.SAPR;
         //    }
         //    const request_line: IMIRequest = {
         //       program: 'OIS100MI',
         //       transaction: 'AddBatchLine',
         //       record: inputRecord_line
         //    };
         //    await this.miService.execute(request_line)
         //       .toPromise()
         //       .then(async (response: any) => {
         //          GlobalConstants.orderError = 0;
         //          console.log(response.items);
         //       })
         //       .catch(function (error) {
         //          GlobalConstants.orderError = 1;
         //          console.log("Add Batch Line Error", error.errorMessage);
         //       });
         //    if (GlobalConstants.orderError == 1) {
         //       this.orderItemError.push({ 'ITNO': itemOrder.ITNO });
         //    }
         // }

         // // let inputRecord_conf = {
         // //    ORNO: ornoValue,
         // // }
         // // const request_line_conf: IMIRequest = {
         // //    program: 'OIS100MI',
         // //    transaction: 'Confirm',
         // //    record: inputRecord_conf,
         // //    outputFields: ['ORNO', 'STAT']
         // // };
         // // await this.miService.execute(request_line_conf)
         // //    .toPromise()
         // //    .then((response: any) => {
         // //       console.log(response.items);
         // //    })
         // //    .catch(function (error) {
         // //       // GlobalConstants.orderError = 1;
         // //       console.log("Confirmation Error", error.errorMessage);
         // //    });

      })
      .catch(function (error) {
         console.log("Add Batch Head Error", error.errorMessage);
         this.isBusy = false;
      });
      // this.selectedInvItems = [];
      // if (args.length > 0) {
      //    args.forEach(item => {
      //       this.selectedInvItems.push(item.data);
      //    });
      // }
      // console.log(this.selectedInvItems);
   }
   else{
      this.isBusy = false;
   }
   }

   async initItemModalLineGrid() {
      const itemModalOptions: SohoDataGridOptions = {
         selectable: 'single' as SohoDataGridSelectable,
         disableRowDeactivation: false,
         clickToSelect: false,
         alternateRowShading: false,
         cellNavigation: true,
         idProperty: 'col-itno',
         paging: true,
         pagesize: this.pageSize,
         indeterminate: false,
         
         filterable: true,
         stickyHeader: false,
         hidePagerOnOnePage: true,
         rowHeight: 'small',
         editable: true,
         columns: [
            {
               width: '5%', id: 'selectionCheckbox', sortable: false,
               resizable: false, align: 'center', formatter: Soho.Formatters.SelectionCheckbox
            },
            {
               width: '15%', id: 'col-stat', field: 'BANO', name: 'Lot Number',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-itno', field: 'QRID', name: 'QI Request ID',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '35%', id: 'col-itds', field: 'ITNO', name: 'Item Number',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-itty', field: 'QSTA', name: 'Status',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-itgr', field: 'RORN', name: 'Reference Order Number',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            },
            {
               width: '15%', id: 'col-itgr', field: 'RORC', name: 'RORC',
               resizable: true, filterType: 'text', filterConditions: ['contains', 'equals'], sortable: true
            }
         ],
         dataset: [],
         emptyMessage: {
            title: 'Empty Item List',
            icon: 'icon-empty-no-data'
         }
      };
      this.itemModalGridOptions = itemModalOptions;
   }

   onClickLoad(): void {
      this.logInfo('onClickLoad');
      // this.setBusy(true);
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {
         // this.setBusy(false);
         this.logInfo('onClickLoad: Received user context');
         this.userContext = userContext;
         this.updateUserValues(userContext);
      }, (error) => {
         // this.setBusy(false);
         this.logError('Unable to get userContext ' + error);
      });
   }

   updateUserValues(userContext: IUserContext) {
      this.company = userContext.company;
      this.division = userContext.division;
      this.language = userContext.language;
      this.email = userContext.EMAL;

      this.currentCompany = userContext.currentCompany;
      this.currentDivision = userContext.currentDivision;
      this.currentLanguage = userContext.currentLanguage;
   }

   private setBusy(isCall: string, isBusy: boolean) {
      if (isCall == "itemModalData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "initialData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "custData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "itemData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "matrixData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "customerData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "excelData") {
         this.isItemModalBusy = isBusy;
      } else if (isCall == "addItemData") {
         this.isItemModalBusy = isBusy;
      }
   }

   ngAfterViewInit(): void {
      /**
       * Note: If using an input like [triggers]="[ '.application-menu-trigger' ]"
       * hookup the app menu trigger once the afterViewInit is called. This will
       * ensure that the toolbar has had a chance to create the application-menu-trugger
       * button.
       * this.applicationMenu.triggers = [ '.application-menu-trigger' ];
       */
      if (this.isApplicationMenuOpen) {
         this.applicationMenu?.openMenu(true, true);
      } else {
         this.applicationMenu?.closeMenu();
      }
   }

   public get isApplicationMenuOpen(): boolean {
      const valueString = localStorage.getItem(AppComponent.IS_APPLICATION_MENU_OPEN_KEY);
      return valueString ? (valueString === 'true') : true;
   }
   public set isApplicationMenuOpen(open: boolean) {
      localStorage.setItem(AppComponent.IS_APPLICATION_MENU_OPEN_KEY, open ? 'true' : 'false');
   }
   // public onChangeTheme(ev: SohoPersonalizeEvent) {
   //    this.useUpliftIcons = ev.data.theme === 'theme-uplift-light'
   //       || ev.data.theme === 'theme-uplift-dark'
   //       || ev.data.theme === 'theme-uplift-contrast';
   // }
   public onMenuVisibility(visible: boolean): void {
      if (this.isApplicationMenuOpen !== visible) {
         this.isApplicationMenuOpen = visible;
      }
   }




}



