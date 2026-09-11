/**
 * Property Tax Calculation Engine & Factor Reference Data
 */
(function () {

const TAX_OPTIONS = {
  WARD: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
  ZONE: ["N/A", "A", "B"],
  BUILD: ["N/A", "PUCCA", "KUCHA", "SEMI-PUCCA"],
  YEAR: [
    "N/A",
    "BEFORE 1970",
    "ABOVE 1971 TO 1980",
    "ABOVE 1981 TO 2002",
    "ABOVE 2003 TO 2021",
    "2021 & BEYOND"
  ],
  OCCUPANCY: [
    "N/A",
    "SELF RESIDENTIAL",
    "LETOUT RESIDENTIAL",
    "UNDER CONSTRUCTION",
    "CATTLE SHED",
    "HOTELS",
    "SHOWROOMS",
    "RESTAURANT",
    "BARS",
    "BANKS",
    "ATMS",
    "CALL CENTRE",
    "MARRIAGE HALL",
    "TRAVEL AGENCY",
    "MOBILE TOWER",
    "COACHING",
    "SHOPS",
    "SCHOOL",
    "COLLEGES",
    "EDUCATIONAL INSTITUTIONS",
    "OFFICES",
    "HOSTEL",
    "HOSPITAL",
    "THEATRE",
    "CLUBS",
    "PAYING GUEST HOUSE",
    "GUEST HOUSE",
    "GODOWNS",
    "STORE",
    "DHABAS",
    "STALL",
    "OTHERS",
    "PUBLIC WORSHIP",
    "BURIAL & CREMATION"
  ]
};

const TAX_FACTORS = {
  ZONE: {
    "A": { f1: 2.5, f5: 7.0 },
    "ZONE A": { f1: 2.5, f5: 7.0 },
    "B": { f1: 3.0, f5: 2.0 },
    "ZONE B": { f1: 3.0, f5: 2.0 }
  },
  BUILDING: {
    "PUCCA": 3.0,
    "PUCCA BUILDING": 3.0,
    "SEMI-PUCCA": 2.0,
    "SEMI PUCCA": 2.0,
    "SEMI PUCCA BUILDING": 2.0,
    "KUCHA": 1.5,
    "KUCHA BUILDING": 1.5
  },
  YEAR: {
    "2021 & BEYOND": 6.0,
    "ABOVE 2003 TO 2021": 5.0,
    "ABOVE 1981 TO 2002": 4.0,
    "ABOVE 1971 TO 1980": 3.0,
    "BEFORE 1970": 2.0
  },
  TAX_RATE: 0.125,
  MAINTENANCE_REBATE: 0.10
};

const normStr = v => String(v ?? "").trim().toUpperCase();

function resolveF1(zoneVal) {
  const z = normStr(zoneVal);
  return TAX_FACTORS.ZONE[z] ? TAX_FACTORS.ZONE[z].f1 : 0;
}

function resolveF5(zoneVal) {
  const z = normStr(zoneVal);
  return TAX_FACTORS.ZONE[z] ? TAX_FACTORS.ZONE[z].f5 : 0;
}

function resolveF2(buildVal) {
  const b = normStr(buildVal);
  if (b.includes("SEMI")) return 2.0;
  if (b.includes("PUCCA")) return 3.0;
  if (b.includes("KUCHA") || b.includes("KATCHA")) return 1.5;
  return 0;
}

function resolveF3(yearVal) {
  const y = normStr(yearVal);
  if (y.includes("BEYOND")) return 6.0;
  if (y.includes("2021")) return 5.0;
  if (y.includes("2002")) return 4.0;
  if (y.includes("1980")) return 3.0;
  if (y.includes("1970") || y.includes("BEFORE")) return 2.0;
  return 0;
}

function resolveF4(occupancyVal, areaSqM) {
  const occ = normStr(occupancyVal);
  const area = parseFloat(areaSqM) || 0;

  if (["UNDER CONSTRUCTION", "CATTLE SHED", "PUBLIC WORSHIP", "BURIAL & CREMATION", "N/A", ""].includes(occ)) {
    return 0;
  }

  if (occ.includes("SELF")) return 3.0;
  if (occ.includes("LETOUT") || occ.includes("LET OUT")) return 6.0;

  if (occ === "HOTELS" || occ === "SHOWROOMS" || occ === "RESTAURANT") {
    if (area > 300) return 10.0;
    if (area >= 100) return 8.0;
    return 5.0;
  }

  const groupC = ["BARS", "BANKS", "ATMS", "CALL CENTRE", "MARRIAGE HALL", "TRAVEL AGENCY", "MOBILE TOWER", "COACHING"];
  if (groupC.some(k => occ.includes(k))) return 5.0;

  const groupD = ["SHOPS", "SCHOOL", "COLLEGES", "EDUCATIONAL INSTITUTIONS", "OFFICES", "HOSTEL", "HOSPITAL", "THEATRE", "CLUBS", "PAYING GUEST HOUSE", "GUEST HOUSE"];
  if (groupD.some(k => occ.includes(k))) return 4.0;

  const groupE = ["GODOWNS", "STORE", "DHABAS", "STALL", "OTHERS"];
  if (groupE.some(k => occ.includes(k))) return 3.0;

  return 3.0;
}

function calculateEntryTax(entry) {
  if (!entry || normStr(entry.yes_no) !== "YES") return 0;

  const area = parseFloat(entry.area);
  if (isNaN(area) || area <= 0) return 0;

  const f1 = resolveF1(entry.zone);
  const f2 = resolveF2(entry.building_type);
  const f3 = resolveF3(entry.year);
  const f4 = resolveF4(entry.occupancy, area);
  const f5 = resolveF5(entry.zone);

  if (!f1 || !f2 || !f3 || !f4 || !f5) return 0;

  const unitRate = f1 * f2 * f3 * f4 * f5;
  const grossARV = area * unitRate;
  const netARV = grossARV * (1 - TAX_FACTORS.MAINTENANCE_REBATE);
  const netTax = netARV * TAX_FACTORS.TAX_RATE;

  return isNaN(netTax) ? 0 : Number(netTax.toFixed(2));
}

function calculateFloorTotalTax(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + calculateEntryTax(entry), 0);
  return Number(sum.toFixed(2));
}

// Global browser window export
window.TaxCalculator = {
  ULB_NAME: "MC Paonta Sahib",
  OPTIONS: TAX_OPTIONS,
  FACTORS: TAX_FACTORS,
  calculateEntryTax,
  calculateFloorTotalTax,
  resolveF1,
  resolveF2,
  resolveF3,
  resolveF4,
  resolveF5
};

})();