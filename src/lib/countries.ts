// Countries players can guess, from Natural Earth's 1:50m countries
// (public domain, https://www.naturalearthdata.com). Each has a label point
// inside the country, used to measure distances, and other names it's known
// by, including historical ones museums use, like "Persia" or "Bohemia".
type Row = [code: string, name: string, lat: number, lon: number, aliases?: string[]];

const ROWS: Row[] = [
  ["AF", "Afghanistan", 34.16, 66.5],
  ["AX", "Åland", 60.16, 19.87, ["Åland Islands"]],
  ["AL", "Albania", 40.65, 20.11],
  ["DZ", "Algeria", 27.4, 2.81],
  ["AS", "American Samoa", -14.33, -170.75],
  ["AD", "Andorra", 42.55, 1.54],
  ["AO", "Angola", -12.18, 17.98],
  ["AI", "Anguilla", 18.24, -63.03],
  ["AG", "Antigua and Barbuda", 17.35, -61.79],
  ["AR", "Argentina", -33.5, -64.17],
  ["AM", "Armenia", 40.46, 44.8],
  ["AW", "Aruba", 12.52, -69.97],
  ["AU", "Australia", -24.13, 134.05],
  ["AT", "Austria", 47.52, 14.13],
  ["AZ", "Azerbaijan", 40.4, 47.21],
  ["BS", "Bahamas", 26.4, -77.15],
  ["BH", "Bahrain", 26.06, 50.55],
  ["BD", "Bangladesh", 24.21, 89.68],
  ["BB", "Barbados", 13.16, -59.57],
  ["BY", "Belarus", 53.82, 28.42],
  ["BE", "Belgium", 50.79, 4.8],
  ["BZ", "Belize", 17.2, -88.71],
  ["BJ", "Benin", 10.32, 2.35, ["Dahomey"]],
  ["BM", "Bermuda", 32.3, -64.76],
  ["BT", "Bhutan", 27.54, 90.04],
  ["BO", "Bolivia", -16.67, -64.59],
  ["BA", "Bosnia and Herzegovina", 44.09, 18.07],
  ["BW", "Botswana", -22.1, 24.18],
  ["BR", "Brazil", -12.1, -49.56],
  ["VG", "British Virgin Islands", 18.43, -64.64],
  ["BN", "Brunei", 4.45, 114.55, ["Brunei Darussalam"]],
  ["BG", "Bulgaria", 42.51, 25.16],
  ["BF", "Burkina Faso", 12.67, -1.36],
  ["BI", "Burundi", -3.33, 29.92],
  ["KH", "Cambodia", 12.65, 104.5],
  ["CM", "Cameroon", 4.59, 12.47],
  ["CA", "Canada", 60.32, -101.91],
  ["CV", "Cape Verde", 15.07, -23.64, ["Cabo Verde", "Republic of Cabo Verde"]],
  ["KY", "Cayman Islands", 19.32, -81.24],
  ["CF", "Central African Republic", 6.99, 20.91],
  ["TD", "Chad", 15.14, 18.65],
  ["CL", "Chile", -38.15, -72.32],
  ["CN", "China", 32.5, 106.34, ["People's Republic of China"]],
  ["CO", "Colombia", 3.37, -73.17],
  ["KM", "Comoros", -11.73, 43.32],
  ["CK", "Cook Islands", -21.22, -159.79],
  ["CR", "Costa Rica", 10.07, -84.08],
  ["HR", "Croatia", 45.81, 16.37],
  ["CU", "Cuba", 21.33, -77.98],
  ["CW", "Curaçao", 12.15, -68.92],
  ["CY", "Cyprus", 34.91, 33.08],
  ["CZ", "Czechia", 49.88, 15.38, ["Czech Republic", "Česko", "Bohemia", "Moravia", "Czechoslovakia"]],
  ["CD", "Democratic Republic of the Congo", -1.86, 23.46, ["Zaire", "Congo (Kinshasa)"]],
  ["DK", "Denmark", 55.97, 9.02],
  ["DJ", "Djibouti", 11.98, 42.5],
  ["DM", "Dominica", 15.46, -61.34],
  ["DO", "Dominican Republic", 19.1, -70.65],
  ["TL", "East Timor", -8.8, 125.85, ["Timor-Leste"]],
  ["EC", "Ecuador", -1.26, -78.19],
  ["EG", "Egypt", 26.19, 29.45],
  ["SV", "El Salvador", 13.69, -88.89],
  ["GQ", "Equatorial Guinea", 2.33, 8.99],
  ["ER", "Eritrea", 15.79, 38.29],
  ["EE", "Estonia", 58.72, 25.87],
  ["SZ", "Eswatini", -26.53, 31.47, ["Kingdom of eSwatini", "Swaziland"]],
  ["ET", "Ethiopia", 8.03, 39.09],
  ["FK", "Falkland Islands", -51.61, -58.74, ["Falkland Islands / Malvinas", "Islas Malvinas"]],
  ["FO", "Faroe Islands", 62.19, -7.06, ["Faeroe Islands"]],
  ["FJ", "Fiji", -17.83, 177.98],
  ["FI", "Finland", 63.25, 27.28],
  ["FR", "France", 46.7, 2.55],
  ["PF", "French Polynesia", -17.63, -149.46],
  ["GA", "Gabon", -0.44, 11.84],
  ["GM", "Gambia", 13.64, -15.0],
  ["GE", "Georgia", 41.87, 43.74],
  ["DE", "Germany", 50.96, 9.68, ["Prussia", "West Germany", "East Germany"]],
  ["GH", "Ghana", 7.72, -1.04, ["Gold Coast"]],
  ["GR", "Greece", 39.49, 21.73],
  ["GL", "Greenland", 74.32, -39.34],
  ["GD", "Grenada", 12.11, -61.68],
  ["GU", "Guam", 13.35, 144.7],
  ["GT", "Guatemala", 14.98, -90.5],
  ["GG", "Guernsey", 49.46, -2.56],
  ["GN", "Guinea", 10.62, -10.02],
  ["GW", "Guinea-Bissau", 12.16, -14.52],
  ["GY", "Guyana", 5.12, -58.94],
  ["HT", "Haiti", 19.26, -72.22],
  ["HN", "Honduras", 14.79, -86.89],
  ["HK", "Hong Kong", 22.45, 114.1],
  ["HU", "Hungary", 47.09, 19.45],
  ["IS", "Iceland", 64.78, -18.67],
  ["IN", "India", 22.69, 79.36],
  ["ID", "Indonesia", -0.95, 101.89],
  ["IR", "Iran", 32.17, 54.93, ["Persia"]],
  ["IQ", "Iraq", 33.09, 43.26, ["Mesopotamia"]],
  ["IE", "Ireland", 53.08, -7.8],
  ["IM", "Isle of Man", 54.22, -4.53],
  ["IL", "Israel", 30.91, 34.85],
  ["IT", "Italy", 44.73, 11.08],
  ["CI", "Ivory Coast", 7.49, -5.57, ["Côte d'Ivoire"]],
  ["JM", "Jamaica", 18.14, -77.32],
  ["JP", "Japan", 36.14, 138.44],
  ["JE", "Jersey", 49.22, -2.09],
  ["JO", "Jordan", 30.81, 36.38],
  ["KZ", "Kazakhstan", 49.05, 68.69],
  ["KE", "Kenya", 0.55, 37.91],
  ["KI", "Kiribati", 1.82, -157.38],
  ["XK", "Kosovo", 42.59, 20.86],
  ["KW", "Kuwait", 29.41, 47.31],
  ["KG", "Kyrgyzstan", 41.67, 74.53],
  ["LA", "Laos", 19.43, 102.53, ["Lao PDR"]],
  ["LV", "Latvia", 57.07, 25.46],
  ["LB", "Lebanon", 34.13, 35.99],
  ["LS", "Lesotho", -29.48, 28.25],
  ["LR", "Liberia", 6.45, -9.46],
  ["LY", "Libya", 26.64, 18.01],
  ["LI", "Liechtenstein", 47.11, 9.56],
  ["LT", "Lithuania", 55.1, 24.09],
  ["LU", "Luxembourg", 49.73, 6.08],
  ["MO", "Macau", 22.13, 113.56, ["Macao"]],
  ["MG", "Madagascar", -18.63, 46.7],
  ["MW", "Malawi", -13.39, 33.61],
  ["MY", "Malaysia", 2.53, 113.84],
  ["MV", "Maldives", 4.17, 73.51],
  ["ML", "Mali", 18.69, -2.04],
  ["MT", "Malta", 35.89, 14.43],
  ["MH", "Marshall Islands", 7.08, 171.19],
  ["MR", "Mauritania", 19.59, -9.74],
  ["MU", "Mauritius", -20.3, 57.57],
  ["MX", "Mexico", 23.92, -102.29],
  ["FM", "Micronesia", 6.89, 158.23, ["Federated States of Micronesia"]],
  ["MD", "Moldova", 47.43, 28.49],
  ["MC", "Monaco", 43.74, 7.4],
  ["MN", "Mongolia", 46.0, 104.15],
  ["ME", "Montenegro", 42.8, 19.14],
  ["MS", "Montserrat", 16.74, -62.19],
  ["MA", "Morocco", 31.65, -7.19],
  ["MZ", "Mozambique", -13.94, 37.84],
  ["MM", "Myanmar", 21.57, 95.8, ["Burma"]],
  ["NA", "Namibia", -20.58, 17.11],
  ["NR", "Nauru", -0.52, 166.93],
  ["NP", "Nepal", 28.3, 83.64],
  ["NL", "Netherlands", 52.42, 5.61, ["Holland"]],
  ["NC", "New Caledonia", -21.06, 165.08],
  ["NZ", "New Zealand", -39.76, 172.79],
  ["NI", "Nicaragua", 12.67, -85.07],
  ["NE", "Niger", 17.45, 9.5],
  ["NG", "Nigeria", 9.44, 7.5],
  ["NU", "Niue", -19.05, -169.86],
  ["NF", "Norfolk Island", -29.03, 167.95],
  ["KP", "North Korea", 39.89, 126.44, ["Democratic People's Republic of Korea"]],
  ["MK", "North Macedonia", 41.56, 21.56],
  ["MP", "Northern Mariana Islands", 15.19, 145.73],
  ["NO", "Norway", 61.36, 9.68],
  ["OM", "Oman", 22.12, 57.34],
  ["PK", "Pakistan", 29.33, 68.55],
  ["PW", "Palau", 7.52, 134.58],
  ["PS", "Palestine", 32.05, 35.29],
  ["PA", "Panama", 8.72, -80.35],
  ["PG", "Papua New Guinea", -5.7, 143.91],
  ["PY", "Paraguay", -21.67, -60.15],
  ["PE", "Peru", -12.98, -72.9],
  ["PH", "Philippines", 11.2, 122.47],
  ["PN", "Pitcairn Islands", -24.36, -128.32],
  ["PL", "Poland", 51.99, 19.49],
  ["PT", "Portugal", 39.61, -8.27],
  ["PR", "Puerto Rico", 18.23, -66.48],
  ["QA", "Qatar", 25.24, 51.14],
  ["CG", "Republic of the Congo", 0.14, 15.9, ["Congo", "Congo (Brazzaville)"]],
  ["RO", "Romania", 45.73, 24.97],
  ["RU", "Russia", 58.25, 44.69, ["Russian Federation", "Soviet Union", "USSR"]],
  ["RW", "Rwanda", -1.9, 30.1],
  ["BL", "Saint Barthélemy", 17.9, -62.83, ["St-Barthélemy"]],
  ["SH", "Saint Helena", -15.95, -5.71],
  ["KN", "Saint Kitts and Nevis", 17.34, -62.76],
  ["LC", "Saint Lucia", 13.89, -60.98],
  ["MF", "Saint Martin", 18.08, -63.05, ["St-Martin"]],
  ["PM", "Saint Pierre and Miquelon", 47.04, -56.33],
  ["VC", "Saint Vincent and the Grenadines", 13.09, -61.34],
  ["WS", "Samoa", -13.64, -172.44],
  ["SM", "San Marino", 43.93, 12.44],
  ["ST", "São Tomé and Príncipe", 0.97, 7.02],
  ["SA", "Saudi Arabia", 23.81, 44.7],
  ["SN", "Senegal", 15.14, -14.78],
  ["RS", "Serbia", 44.19, 20.79, ["Republic of Serbia"]],
  ["SC", "Seychelles", -4.68, 55.48],
  ["SL", "Sierra Leone", 8.62, -11.76],
  ["SG", "Singapore", 1.37, 103.82],
  ["SX", "Sint Maarten", 18.04, -63.07],
  ["SK", "Slovakia", 48.73, 19.05],
  ["SI", "Slovenia", 46.06, 14.92],
  ["SB", "Solomon Islands", -8.03, 159.17],
  ["SO", "Somalia", 3.57, 45.19],
  ["ZA", "South Africa", -29.71, 23.67],
  ["KR", "South Korea", 36.38, 128.13, ["Republic of Korea", "Korea"]],
  ["SS", "South Sudan", 7.23, 30.39],
  ["ES", "Spain", 40.09, -3.46],
  ["LK", "Sri Lanka", 7.58, 80.7, ["Ceylon"]],
  ["SD", "Sudan", 16.33, 29.26],
  ["SR", "Suriname", 4.14, -55.91],
  ["SE", "Sweden", 65.86, 19.02],
  ["CH", "Switzerland", 46.72, 7.46],
  ["SY", "Syria", 35.01, 38.28],
  ["TW", "Taiwan", 23.65, 120.87, ["Formosa"]],
  ["TJ", "Tajikistan", 38.2, 72.59],
  ["TZ", "Tanzania", -6.05, 34.96, ["United Republic of Tanzania"]],
  ["TH", "Thailand", 15.46, 101.07, ["Siam"]],
  ["TG", "Togo", 8.81, 1.06],
  ["TO", "Tonga", -21.21, -175.16],
  ["TT", "Trinidad and Tobago", 11.0, -60.92],
  ["TN", "Tunisia", 33.69, 9.01],
  ["TR", "Turkey", 39.35, 34.51, ["Türkiye", "Anatolia", "Asia Minor", "Ottoman Empire"]],
  ["TM", "Turkmenistan", 39.86, 58.68],
  ["TC", "Turks and Caicos Islands", 21.82, -71.75],
  ["TV", "Tuvalu", -8.51, 179.21],
  ["UG", "Uganda", 1.97, 32.95],
  ["UA", "Ukraine", 49.72, 32.14],
  ["AE", "United Arab Emirates", 23.47, 54.55],
  ["GB", "United Kingdom", 54.4, -2.12, ["England", "Scotland", "Wales", "Northern Ireland", "Great Britain", "Britain", "UK"]],
  ["US", "United States", 39.54, -97.48, ["United States of America", "USA"]],
  ["VI", "United States Virgin Islands", 17.75, -64.78],
  ["UY", "Uruguay", -32.96, -55.97],
  ["UZ", "Uzbekistan", 41.69, 64.01],
  ["VU", "Vanuatu", -15.37, 166.91],
  ["VA", "Vatican City", 41.9, 12.45, ["Vatican", "Holy See"]],
  ["VE", "Venezuela", 7.18, -64.6],
  ["VN", "Vietnam", 21.72, 105.39, ["Viet Nam"]],
  ["WF", "Wallis and Futuna", -14.29, -178.14, ["Wallis and Futuna Islands"]],
  ["EH", "Western Sahara", 23.97, -12.63],
  ["YE", "Yemen", 15.33, 45.87],
  ["ZM", "Zambia", -14.66, 26.4],
  ["ZW", "Zimbabwe", -18.91, 29.93, ["Rhodesia"]],
];

export type Country = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  aliases: string[];
};

export const COUNTRIES: Country[] = ROWS.map(([code, name, lat, lon, aliases = []]) => ({
  code,
  name,
  lat,
  lon,
  aliases,
}));

/** Lowercase, without accents, punctuation or a leading "the". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^the /, "");
}

const byCode = new Map(COUNTRIES.map((country) => [country.code, country]));
const byName = new Map<string, Country>();
for (const country of COUNTRIES) {
  for (const name of [country.name, ...country.aliases]) {
    byName.set(normalize(name), country);
  }
}

export function countryByCode(code: unknown): Country | undefined {
  return typeof code === "string" ? byCode.get(code) : undefined;
}

/** The country with exactly this name or alias. */
export function findCountry(name: string): Country | undefined {
  return byName.get(normalize(name));
}

/** Countries matching what a player has typed so far, best matches first. */
export function searchCountries(query: string, limit = 8): Country[] {
  const q = normalize(query);
  if (!q) return [];
  const matches: [score: number, country: Country][] = [];
  for (const country of COUNTRIES) {
    let score = Infinity;
    [country.name, ...country.aliases].forEach((name, i) => {
      const n = normalize(name);
      if (n.startsWith(q)) score = Math.min(score, i === 0 ? 0 : 1);
      else if (n.includes(` ${q}`)) score = Math.min(score, 2);
    });
    if (score !== Infinity) matches.push([score, country]);
  }
  return matches
    .sort((a, b) => a[0] - b[0])
    .slice(0, limit)
    .map(([, country]) => country);
}

/** The flag emoji for a two-letter country code. */
export function flag(code: string): string {
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
