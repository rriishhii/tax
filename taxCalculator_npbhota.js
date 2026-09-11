(function () {
/**
 * Property Tax Calculation Engine & Factor Reference Data
 */

const TAX_OPTIONS = {
  WARD: ["1", "2", "3", "4", "5", "6", "7"],
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


const normStr = v => String(v ?? "").trim().toUpperCase();

// Global browser window export
window.TaxCalculator = {
  ULB_NAME: "NP Bhota",
  OPTIONS: TAX_OPTIONS,
};
})();
