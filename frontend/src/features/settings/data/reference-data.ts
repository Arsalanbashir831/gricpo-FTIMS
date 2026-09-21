import { equipmentCategories } from "@/features/equipment/data/sample-equipment-summary";
import { defaultAccessories, projectSiteOptions } from "@/features/allocations/data/sample-allocations";

export const referenceGroups = [
  { id: "categories", title: "Equipment categories", singular: "category", description: "Classify inventory for equipment forms and reports." },
  { id: "disciplines", title: "Technician disciplines", singular: "discipline", description: "Skills and specialties used on technician profiles." },
  { id: "methods", title: "Test methods", singular: "test method", description: "Methods used when preparing field test reports." },
  { id: "sites", title: "Projects / sites", singular: "site", description: "Site options used during allocation and transfer." },
  { id: "statuses", title: "Status codes", singular: "status code", description: "Labels used to classify equipment activity." },
  { id: "accessories", title: "Accessory types", singular: "accessory type", description: "Items that can be issued or returned with equipment." },
] as const;
export type ReferenceGroupId = (typeof referenceGroups)[number]["id"];
export type ReferenceItem = { id: string; name: string; description: string; active: boolean; system?: boolean };
export type ReferenceCatalog = Record<ReferenceGroupId, ReferenceItem[]>;
const entries = (names: string[], descriptions: Record<string, string> = {}, system = false): ReferenceItem[] => names.map((name, index) => ({ id: `seed-${index}-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`, name, description: descriptions[name] ?? "", active: true, system }));
export const seedCatalog: ReferenceCatalog = {
  categories: entries(equipmentCategories.map((item) => item.name), {
    "PMI / XRF": "Positive material identification equipment", "UT / NDT": "Ultrasonic testing equipment",
    PWHT: "Post weld heat treatment equipment", Hardness: "Hardness testing equipment",
    Inspection: "Visual and dimensional inspection equipment", Metallography: "Metallurgical sample preparation equipment", Other: "Miscellaneous testing equipment",
  }),
  disciplines: entries(["PMI / XRF", "UT / NDT", "UT / PAUT", "UT / TOFD", "MT / PT", "Radiography", "Borescope", "Hardness", "UCI", "Visual inspection", "Leak testing", "Other"]),
  methods: entries(["PMI / XRF", "UT / NDT", "PWHT", "Hardness", "Metallography", "Visual inspection", "MT / PT", "Radiography", "Other"]),
  sites: entries(projectSiteOptions),
  statuses: entries(["Available", "Allocated", "Under repair", "Calibration due", "Calibration expired", "Returned", "Transferred"], {}, true),
  accessories: entries(defaultAccessories),
};
export function activeReferenceNames(catalog: ReferenceCatalog, group: ReferenceGroupId) {
  return catalog[group].filter((item) => item.active).map((item) => item.name);
}
