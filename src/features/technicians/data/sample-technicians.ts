export type TechnicianStatus = "Active" | "On leave" | "Inactive" | "Training";

export type TechnicianCertification = {
  name: string;
  level: string;
  expiresOn: string;
};

export type TechnicianActivity = {
  date: string;
  action: string;
  detail: string;
};

export type TechnicianRecord = {
  id: string;
  name: string;
  discipline: string;
  qualification: string;
  phone: string;
  email: string;
  location: string;
  joinedOn: string;
  reportingTo: string;
  status: TechnicianStatus;
  skills: string[];
  certifications: TechnicianCertification[];
  assignedEquipmentIds: string[];
  activeProjects: string[];
  history: TechnicianActivity[];
};

const equipmentIds = [
  "GRIP-PMI-007", "GRIP-UT-011", "GRIP-HDT-004", "GRIP-PWHT-002", "GRIP-PT-003",
  "GRIP-MT-006", "GRIP-BOR-001", "GRIP-DFT-002", "GRIP-UT-003", "GRIP-PT-005",
];

function profile(input: {
  id: number; name: string; discipline: string; qualification: string; phone: string;
  status?: TechnicianStatus; equipmentCount: number; skills?: string[];
  projects?: string[]; reportingTo?: string;
}): TechnicianRecord {
  const id = `TECH-${String(input.id).padStart(3, "0")}`;
  const email = `${input.name.toLowerCase().replaceAll(/[^a-z]+/g, ".").replace(/\.$/, "")}@gripco.com`;
  const assignedEquipmentIds = Array.from({ length: input.equipmentCount }, (_, index) => equipmentIds[(input.id + index - 1) % equipmentIds.length]);
  return {
    id, name: input.name, discipline: input.discipline, qualification: input.qualification,
    phone: input.phone, email, location: "Karachi, Pakistan", joinedOn: "2024-01-12",
    reportingTo: input.reportingTo ?? "Muhammad Ali (Tech Lead)", status: input.status ?? "Active",
    skills: input.skills ?? [input.discipline],
    certifications: [{ name: input.discipline, level: input.qualification, expiresOn: "2027-12-31" }],
    assignedEquipmentIds, activeProjects: input.projects ?? ["Ras Tanura Refinery"],
    history: [
      ...(assignedEquipmentIds.length ? [{ date: "2026-09-12", action: "Equipment assigned", detail: assignedEquipmentIds[0] }] : []),
      { date: "2026-08-20", action: "Certification reviewed", detail: input.qualification },
      { date: "2024-01-12", action: "Joined GRIPCO", detail: input.discipline },
    ],
  };
}

const featured: TechnicianRecord[] = [
  profile({ id: 1, name: "Ahmed Khan", discipline: "PMI / XRF", qualification: "ASNT Level II", phone: "+92 300 1234567", equipmentCount: 5, skills: ["PMI / XRF", "Positive Material Identification", "LQA / API"], projects: ["Ras Tanura Refinery", "SPARK – Ras Tanura"] }),
  profile({ id: 2, name: "Salman Ali", discipline: "UT / PAUT", qualification: "ASNT Level II", phone: "+92 321 9876543", equipmentCount: 3, projects: ["Jafurah Gas Project"] }),
  profile({ id: 3, name: "Sameer Ahmed", discipline: "MT / PT", qualification: "ASNT Level II", phone: "+92 333 4567890", equipmentCount: 7, skills: ["MT / PT", "Visual inspection"], projects: ["Jafurah Gas Project", "Shaybah Expansion"] }),
  profile({ id: 4, name: "Bilal Hussain", discipline: "Radiography", qualification: "Level II (RT)", phone: "+92 315 1112233", status: "On leave", equipmentCount: 2, projects: [] }),
  profile({ id: 5, name: "Danish Iqbal", discipline: "Borescope", qualification: "Certified", phone: "+92 300 7654321", equipmentCount: 4, projects: ["Yanbu Petrochemical"] }),
  profile({ id: 6, name: "Khalid Mehmood", discipline: "Hardness", qualification: "ASNT Level II", phone: "+92 301 2223344", equipmentCount: 6, projects: ["Ras Tanura Refinery"] }),
  profile({ id: 7, name: "Imran Ali", discipline: "UCI", qualification: "Certified", phone: "+92 312 9988776", equipmentCount: 1, projects: ["Jafurah Gas Project"] }),
  profile({ id: 8, name: "Awais Raza", discipline: "PMI / XRF", qualification: "ASNT Level I", phone: "+92 346 1122334", equipmentCount: 3, projects: ["Ras Tanura Refinery"] }),
  profile({ id: 9, name: "Faisal Khan", discipline: "UT / TOFD", qualification: "ASNT Level II", phone: "+92 333 4455667", equipmentCount: 4, projects: ["Shaybah Expansion"] }),
  profile({ id: 10, name: "Nadeem Shah", discipline: "Leak testing", qualification: "Certified", phone: "+92 321 6677889", status: "Inactive", equipmentCount: 0, projects: [] }),
];

const additionalNames = [
  "Irfan Sheikh", "Waqas Ahmad", "Muhammad Ali", "Farhan Ahmed", "Rashid Iqbal", "Ali Raza",
  "Hassan Malik", "Junaid Khan", "Zahid Malik", "Faisal Saleh", "Ahmed Farooq", "Mohammed Farooq",
  "Khalid Anwar", "Noman Tariq", "Usman Saeed", "Tariq Javed", "Kamran Akhtar", "Adnan Bashir",
  "Saad Hussain", "Raza Qureshi", "Asif Mahmood", "Omar Farooq",
];
const disciplines = ["PMI / XRF", "UT / NDT", "MT / PT", "Hardness", "Borescope", "Visual inspection"];

export const sampleTechnicians: TechnicianRecord[] = [
  ...featured,
  ...additionalNames.map((name, index) => profile({
    id: index + 11, name, discipline: disciplines[index % disciplines.length],
    qualification: index % 4 === 0 ? "Certified" : "ASNT Level II",
    phone: `+92 300 ${String(4500000 + index * 17143).padStart(7, "0")}`,
    status: index === 20 ? "On leave" : index === 21 ? "Training" : "Active",
    equipmentCount: (index % 5) + 1,
    skills: index < 4 ? [disciplines[index % disciplines.length], disciplines[(index + 1) % disciplines.length]] : undefined,
    projects: index % 3 === 0 ? ["Ras Tanura Refinery", "Jafurah Gas Project"] : ["Yanbu Petrochemical"],
  })),
];

export function formatTechnicianDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
