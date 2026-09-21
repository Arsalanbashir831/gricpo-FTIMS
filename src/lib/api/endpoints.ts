export const apiEndpoints = {
  auth: {
    signup: "/auth/signup/",
    login: "/auth/login/",
    refresh: "/auth/refresh/",
    verify: "/auth/verify/",
    logout: "/auth/logout/",
    me: "/auth/me/",
  },
  administrators: "/administrators/",
  technicians: "/technicians/",
  masterData: (kind: string) => `/master-data/${encodeURIComponent(kind)}/`,
  clients: "/clients/",
  projectSites: "/project-sites/",
  equipment: "/equipment/",
  equipmentSummary: "/equipment/summary/",
  publicEquipment: (token: string) => `/public/equipment/${encodeURIComponent(token)}/`,
  publicReport: (token: string) => `/public/reports/${encodeURIComponent(token)}/`,
  accessories: "/accessories/",
  allocations: "/allocations/",
  transfers: "/transfers/",
  returns: "/returns/",
  reports: "/reports/",
  calibrations: "/calibrations/",
  calibrationSummary: "/calibrations/summary/",
  faultReports: "/fault-reports/",
  maintenance: "/maintenance/",
  services: "/services/",
  notifications: "/notifications/",
} as const;

export function detailPath(collection: string, id: number | string) {
  return `${collection}${encodeURIComponent(String(id))}/`;
}

export function actionPath(collection: string, id: number | string, action: string) {
  return `${detailPath(collection, id)}${action}/`;
}
