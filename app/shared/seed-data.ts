import { Invoice, WorkOrder } from "./types";

export const seedOrders: WorkOrder[] = [
  { id:"WO-2026-1042", incident:"INC-2026-088", dogs:["Milo","Ruby","Jet"], priority:"Critical", practice:"Sydney Animal Emergency", status:"In Progress", due:"Today, 2:30 pm", limit:4500, service:"Triage, imaging and stabilisation", updated:"12 min ago", notes:"Multi-greyhound transport incident. Monitor Ruby for respiratory distress." },
  { id:"WO-2026-1041", incident:"INC-2026-087", dogs:["Luna"], priority:"Urgent", practice:"North Shore Veterinary Hospital", status:"Awaiting Acknowledgement", due:"Today, 3:15 pm", limit:1800, service:"Emergency consultation and pathology", updated:"28 min ago", notes:"Possible ingestion. Contact case manager before exceeding limit." },
  { id:"WO-2026-1039", incident:"INC-2026-085", dogs:["Banjo","Pepper"], priority:"Moderate", practice:"Western Sydney Vet Care", status:"Completed by Vet", due:"Completed", limit:2600, service:"Wound care and medication", updated:"1 hr ago", notes:"Review treatment evidence before closure." },
  { id:"WO-2026-1036", incident:"INC-2026-081", dogs:["Archie"], priority:"Urgent", practice:"Inner West Animal Hospital", status:"Declined", due:"Overdue", limit:2200, service:"Diagnostic imaging", updated:"2 hrs ago", notes:"Reassignment required." },
  { id:"WO-2026-1034", incident:"INC-2026-079", dogs:["Poppy"], priority:"Routine", practice:"Sydney Animal Emergency", status:"Closed", due:"Completed", limit:950, service:"Consultation and medication", updated:"Yesterday", notes:"Completed and reviewed." },
  { id:"WO-2026-1043", incident:"INC-2026-089", dogs:["Nova"], priority:"Moderate", practice:"Sydney Animal Emergency", status:"Completed by Vet", due:"Completed", limit:1900, service:"Emergency consultation and imaging", updated:"45 min ago", notes:"Treatment completed. Tax invoice may now be submitted." },
  { id:"WO-2026-1044", incident:"INC-2026-090", dogs:["Scout"], priority:"Moderate", practice:"Unassigned", status:"Draft", due:"Not set", limit:1200, service:"Consultation", updated:"5 min ago", notes:"Draft awaiting practice selection." },
];

export const seedInvoices: Invoice[] = [
  { id:"INV-8841", workOrder:"WO-2026-1039", practice:"Western Sydney Vet Care", supplierId:"SUP-1176", invoiceNumber:"WSVC-20491", invoiceDate:"2026-08-20", dueDate:"2026-09-19", currency:"AUD", subtotal:2198.18, gst:219.82, amount:2418, status:"Submitted", version:1, date:"20 Aug 2026", lineItems:[{description:"Emergency wound care and medication",quantity:1,unitPrice:2198.18,gstRate:10,netAmount:2198.18,gstAmount:219.82,grossAmount:2418}], attachmentName:"WSVC-20491.pdf", submittedBy:"Dr Mia Chen", submittedAt:"2026-08-20T05:54:00.000Z" },
  { id:"INV-8837", workOrder:"WO-2026-1034", practice:"Sydney Animal Emergency", supplierId:"SUP-1048", invoiceNumber:"SAE-18837", invoiceDate:"2026-08-19", dueDate:"2026-09-18", currency:"AUD", subtotal:802.27, gst:80.23, amount:882.50, status:"Approved — Ready for export", version:1, date:"19 Aug 2026", lineItems:[{description:"Consultation and medication",quantity:1,unitPrice:802.27,gstRate:10,netAmount:802.27,gstAmount:80.23,grossAmount:882.50}], attachmentName:"SAE-18837.pdf", submittedBy:"Dr Mia Chen", submittedAt:"2026-08-19T04:20:00.000Z", reviewedBy:"Sam Taylor", reviewedAt:"2026-08-19T06:12:00.000Z", reviewComment:"Matched to completed work order and approved limit." },
  { id:"INV-8829", workOrder:"WO-2026-1028", practice:"North Shore Veterinary Hospital", supplierId:"SUP-1102", invoiceNumber:"NSVH-8829", invoiceDate:"2026-08-18", dueDate:"2026-09-17", currency:"AUD", subtotal:1490.91, gst:149.09, amount:1640, status:"Rejected", version:1, date:"18 Aug 2026", lineItems:[{description:"Emergency pathology and observation",quantity:1,unitPrice:1490.91,gstRate:10,netAmount:1490.91,gstAmount:149.09,grossAmount:1640}], attachmentName:"NSVH-8829.pdf", submittedBy:"North Shore Veterinary Hospital", submittedAt:"2026-08-18T03:20:00.000Z", reviewedBy:"Sam Taylor", reviewedAt:"2026-08-18T06:00:00.000Z", reviewComment:"Amount does not match supporting tax invoice." },
];

export const seedPractices = [
  ["Sydney Animal Emergency","Approved","Active","24-hour","SUP-1048","18 min"],
  ["North Shore Veterinary Hospital","Approved","Active","24-hour","SUP-1102","24 min"],
  ["Western Sydney Vet Care","Approved","Active","Extended","SUP-1176","31 min"],
  ["Inner West Animal Hospital","Approved","Active","Extended","SUP-1208","42 min"],
  ["Harbour Veterinary Centre","Pending","Inactive","Business hours","Not mapped","—"],
];

export const seedIncidents = [
  ["INC-2026-090","21 Aug, 10:54","Medical emergency","Newtown NSW","1","Moderate","Draft"],
  ["INC-2026-088","21 Aug, 08:12","Transport incident","Alexandria NSW","3","Critical","Active"],
  ["INC-2026-087","20 Aug, 22:48","Suspected ingestion","Artarmon NSW","1","Urgent","Assigned"],
  ["INC-2026-085","20 Aug, 14:10","Kennel injury","Parramatta NSW","2","Moderate","Review"],
  ["INC-2026-081","19 Aug, 18:35","Suspected fracture","Leichhardt NSW","1","Urgent","Reassignment"],
];
