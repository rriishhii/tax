(function () {
/**
 * Property Tax Calculation Engine (Tax Rates 2)
 * Sourced directly from Tax_Rates_2.xlsx
 */

const TAX_OPTIONS_2 = {
  WARD: ["1", "2", "3", "4", "5", "6", "7" , "8" , "9" , "10" , "11" , "12" ,"13" ],
  ZONE: ["N/A", "A", "B"],
  BUILD: ["N/A", "PUCCA", "KUCHA", "SEMI-PUCCA"],
  YEAR: [
    "N/A",
    "BEFORE 1970",
    "ABOVE 1971 TO 1980",
    "ABOVE 1981 TO 2002",
    "ABOVE 2003 TO 2021",
    "2022 & BEYOND"
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
    "MNC",
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
  ],
  USE_OF_BUILDING: ["N/A", "COMMERCIAL", "RESIDENTIAL"]
};

const TAX_FACTORS_2 = {
  LOCATION_F1: {
    "A": 2.5,
    "ZONE A": 2.5,
    "B": 3.0,
    "ZONE B": 3.0,
  },
  BUILDING_F2: {
    "PUCCA": 3.0,
    "PUCCA BUILDING": 3.0,
    "SEMI-PUCCA": 2.0,
    "SEMI PUCCA": 2.0,
    "SEMI PUCCA BUILDING": 2.0,
    "KUCHA": 1.5,
    "KUCHA BUILDING": 1.5
  },
  YEAR_F3: {
    "2022 & BEYOND": 6.0,
    "ABOVE 2003 TO 2021": 5.0,
    "ABOVE 1981 TO 2002": 4.0,
    "ABOVE 1971 TO 1980": 3.0,
    "BEFORE 1970": 2.0
  },
  USE_OF_BUILDING_F5: {
    "COMMERCIAL": 5.0,
    "A": 5.0,
    "NON RESIDENTIAL": 5.0,
    "RESIDENTIAL": 2.0,
    "B": 2.0
  },
  TAX_RATE: 0.10,          // 10% rateable tax
  MAINTENANCE_REBATE: 0.10  // 10% rebate
};

const normStr = v => String(v ?? "").trim().toUpperCase();

function resolveF1(zoneVal) {
  const z = normStr(zoneVal);
  return TAX_FACTORS_2.LOCATION_F1[z] || 0;
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
  if (y.includes("2022") || y.includes("BEYOND")) return 6.0;
  if (y.includes("2003")) return 5.0;
  if (y.includes("1981")) return 4.0;
  if (y.includes("1971")) return 3.0;
  if (y.includes("1970") || y.includes("BEFORE")) return 2.0;
  return 0;
}

function resolveF4(occupancyVal, areaSqM) {
  const occ = normStr(occupancyVal);
  const area = parseFloat(areaSqM) || 0;

  if (["UNDER CONSTRUCTION", "CATTLE SHED", "PUBLIC WORSHIP", "BURIAL & CREMATION", "N/A", ""].includes(occ)) {
    return 0;
  }

  // Self Residential (a) & Letout Residential (b)
  if (occ.includes("SELF")) return 3.0;
  if (occ.includes("LETOUT") || occ.includes("LET OUT")) return 6.0;

  // MNC is unconditionally Category A (Rate 10.0)
  if (occ === "MNC") return 10.0;

  // Category A & B (Hotels, Showrooms, Restaurants with tiered area thresholds)
  if (occ === "HOTELS" || occ === "SHOWROOMS" || occ === "RESTAURANT") {
    if (area > 500) return 10.0; // Above 500 Sq. mtr.
    if (area >= 200) return 8.0;  // 200 to 500 Sq. mtr.
    return 5.0;                   // Below 200 Sq. mtr.
  }

  // Category C: Other Hotels, Bars, Banks, ATMs, Call Centre, Marriage Hall, etc.
  const groupC = ["BARS", "BANKS", "ATMS", "CALL CENTRE", "MARRIAGE HALL", "TRAVEL AGENCY", "MOBILE TOWER", "COACHING"];
  if (groupC.some(k => occ.includes(k))) return 5.0;

  // Category D: Shops, School, Colleges, Offices, Hospital, Hostel, etc.
  const groupD = ["SHOPS", "SCHOOL", "COLLEGES", "EDUCATIONAL INSTITUTIONS", "OFFICES", "HOSTEL", "HOSPITAL", "THEATRE", "CLUBS", "PAYING GUEST HOUSE", "GUEST HOUSE"];
  if (groupD.some(k => occ.includes(k))) return 4.0;

  // Category E: Godowns, Dhabas, Stall, Store, Others
  const groupE = ["GODOWNS", "STORE", "DHABAS", "STALL", "OTHERS"];
  if (groupE.some(k => occ.includes(k))) return 3.0;

  return 3.0;
}

function resolveF5(useOrZoneVal, occupancyVal) {
  const occ = normStr(occupancyVal || useOrZoneVal);
  const val = normStr(useOrZoneVal);

  // If explicit use is given
  if (val === "RESIDENTIAL" || val === "B") return 2.0;
  if (val === "COMMERCIAL" || val === "A" || val === "NON RESIDENTIAL") return 7.0;

  // Automatically determine from occupancy
  if (occ.includes("RESIDENTIAL")) return 2.0;
  
  // Commercial / Non-Residential occupancies
  if (occ && !["N/A", "UNDER CONSTRUCTION", "CATTLE SHED", "PUBLIC WORSHIP", "BURIAL & CREMATION"].includes(occ)) {
    return 7.0;
  }

  return 7.0;
}

function calculateEntryTax(entry) {
  if (!entry || normStr(entry.yes_no) !== "YES") return 0;

  const area = parseFloat(entry.area);
  if (isNaN(area) || area <= 0) return 0;

  const f1 = resolveF1(entry.zone);
  const f2 = resolveF2(entry.building_type);
  const f3 = resolveF3(entry.year);
  const f4 = resolveF4(entry.occupancy, area);
  const f5 = resolveF5(entry.use_of_building || entry.zone, entry.occupancy);

  if (!f1 || !f2 || !f3 || !f4 || !f5) return 0;

  const unitRate = f1 * f2 * f3 * f4 * f5;
  const grossARV = area * unitRate;
  const netARV = grossARV * (1 - TAX_FACTORS_2.MAINTENANCE_REBATE);
  const netTax = netARV * TAX_FACTORS_2.TAX_RATE;

  return isNaN(netTax) ? 0 : Number(netTax.toFixed(2));
}

function calculateFloorTotalTax(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + calculateEntryTax(entry), 0);
  return Number(sum.toFixed(2));
}

// Window export for browser usage
window.TaxCalculator = {
  ULB_NAME: "MC Nahan",
  OPTIONS: TAX_OPTIONS_2,
  FACTORS: TAX_FACTORS_2,
  calculateEntryTax,
  calculateFloorTotalTax,
  resolveF1,
  resolveF2,
  resolveF3,
  resolveF4,
  resolveF5
};
})();
