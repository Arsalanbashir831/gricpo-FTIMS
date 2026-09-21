export type EquipmentStatus = "Available" | "Allocated" | "Under repair";
export type EquipmentRecord = {
  id: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  calibrationDue: string;
  status: EquipmentStatus;
  site: string;
  custodian: string;
};

export const equipmentSampleRecords: EquipmentRecord[] = [
  { id: "GRIP-PMI-007", description: "X-MET8000", category: "PMI / XRF", brand: "Hitachi", model: "X-MET8000", serialNumber: "XME8-24567", calibrationDue: "2026-09-15", status: "Available", site: "Ras Tanura", custodian: "Store" },
  { id: "GRIP-UT-011", description: "Krautkramer UT", category: "UT / NDT", brand: "Krautkramer", model: "USM 36", serialNumber: "KRU-33678", calibrationDue: "2026-09-20", status: "Allocated", site: "Jafurah", custodian: "Imran Ali" },
  { id: "GRIP-HDT-004", description: "Equotip 550", category: "Hardness", brand: "Proceq", model: "Equotip 550", serialNumber: "PRO-55021", calibrationDue: "2026-09-25", status: "Available", site: "SPARK Abqaiq", custodian: "Store" },
  { id: "GRIP-PWHT-002", description: "Chino Recorder", category: "PWHT", brand: "Chino", model: "KR2000", serialNumber: "CHI-KR-8890", calibrationDue: "2026-09-28", status: "Allocated", site: "Shaybah", custodian: "Bilal Hussain" },
  { id: "GRIP-PT-003", description: "UV Lamp", category: "Inspection", brand: "Magnaflux", model: "ZB-100F", serialNumber: "MAG-UV-1134", calibrationDue: "2026-09-30", status: "Under repair", site: "Workshop", custodian: "Maintenance" },
  { id: "GRIP-MT-006", description: "MT Yoke", category: "MT / PT", brand: "Magnaflux", model: "Y-7", serialNumber: "MAG-Y7-7788", calibrationDue: "2026-10-02", status: "Available", site: "Yanbu", custodian: "Store" },
  { id: "GRIP-BOR-001", description: "Video Boroscope", category: "Other", brand: "Olympus", model: "IPLEX G Lite", serialNumber: "OLY-IPL-4592", calibrationDue: "2026-10-05", status: "Allocated", site: "Yanbu", custodian: "Danish" },
  { id: "GRIP-DFT-002", description: "DFT Gauge", category: "Inspection", brand: "Elcometer", model: "456", serialNumber: "ELC-456-3011", calibrationDue: "2026-10-10", status: "Available", site: "Ras Tanura", custodian: "Store" },
  { id: "GRIP-UT-003", description: "UT Thickness", category: "UT / NDT", brand: "Olympus", model: "38DL PLUS", serialNumber: "OLY-38-7721", calibrationDue: "2026-10-12", status: "Available", site: "Jafurah", custodian: "Store" },
  { id: "GRIP-PT-005", description: "PT Kit", category: "MT / PT", brand: "Magnaflux", model: "ZL-60D", serialNumber: "MAG-PT-6600", calibrationDue: "2026-10-14", status: "Allocated", site: "Shaybah", custodian: "Imran" },
];
