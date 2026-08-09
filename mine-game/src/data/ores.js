// Every Natura ore belongs to a layer pool. Rank within that pool determines
// its default odds, rarity, and selling value; shared ores keep one identity.
export const ORE_NAMES_BY_LAYER = {
  stone: ['Stone', 'Copper', 'Quartz', 'Iron', 'Agate', 'Amber', 'Cobalt', 'Mica', 'Chrysoberyl', 'Orpiment', 'Phlogopite', 'Petrified Wood', 'Enstatite', 'Lazulite', 'Elusium', 'Antiquite', 'Unobtainium', 'Aesthetium', 'Aegistone', 'Scertanium', 'Penumbrosia', 'Pasivium', 'Pastelorium', 'Gradience', 'Vaporwave Crystal', 'Endozivite'],
  basalt: ['Basalt', 'Coal', 'Copper', 'Quartz', 'Iron', 'Hemimorphite', 'Druzurite', 'Turquenite', 'Cobalt', 'Yvonite', 'Chalcedony', 'Bluesteel', 'Afghanite', 'Cryoclase', 'Coldfirium', 'Lavendulan', 'Tanzanite', 'Elysian', 'Nocturnite', 'Nuummite', 'Freon', 'Snoblintium', 'Nauticalis', 'Azuryl', 'Glacielle', 'Cybernetium', 'Bulbalescense', 'Inclemetite'],
  granite: ['Granite', 'Coal', 'Quartz', 'Iron', 'Variscite', 'Emerald', 'Peridot', 'Olivine', 'Tsavorite', 'Wavellite', 'Uranium', 'Actinolite', 'Zellerite', 'Viridian', 'Elvengreen', 'Promethium', 'Eluxant', 'Newtonium', 'Prasiloudis', 'Elexinite', 'Astatine', 'Oviridis', 'Elegascene', 'Spristium', 'Erodimium', 'Runealith', 'Candilium', 'Terratomere'],
  diorite: ['Diorite', 'Coal', 'Quartz', 'Gypsum', 'Silver', 'Albite', 'Lead', 'Chroma Contaris', 'Howlite', 'Musgravite', 'Aegirine', 'Osmium', 'Black Diamond', 'Quenselite', 'Patronite', 'Spatializine', 'Eluryan', 'Lanthanite', 'Animyl', 'Neptunium', 'Monocage', 'Acceleratium', 'Quandrium', 'Lucidium', 'Polarium', 'Eclipsicle', 'Illusory Bubblegram'],
  obsidian: ['Obsidian', 'Coal', 'Quartz', 'Silver', 'Iolite', 'Ruby', 'Onyx', 'Obsidian Glass', 'Chroma Contaris', 'Bloodstone', 'Carnelian', 'Painite', 'Sugilite', 'Adurite', 'Rhodonite', 'Purpurite', 'Jet', 'Erythrite', 'Zefendium', 'Viscriol', 'Exolite', 'Blazuine', 'Obscuralis', 'Formidulus', 'Speatrium', 'Sentient Viscera', 'Inkonium', 'Ravenmare', 'Nyctophyte'],
  marble: ['Marble', 'Quartz', 'Silver', 'Gold', 'Iridium', 'Alabaster', 'Bismuth', 'Padparadscha', 'Schizolite', 'Petalite', 'Ametrine', 'Delectium', 'Alexandrite', 'Theiograph', 'Rainbonite', 'Prismatica', 'Seraphrite', 'Chromatite', 'Photoprisma', 'Temporum', 'Ornalium', 'Aether', 'Trinitium', 'Luminatite', 'Elementium', 'Musereign', 'Idolium'],
  mantle: ['Mantle', 'Molybdenum', 'Gold', 'Holmium', 'Andalusite', 'Cuspidine', 'Ancient Bronze', 'Galvanite', 'Plutonium', 'Pyrite', 'Antimony', 'Glaucodot', 'Solid Bromine', 'Rusticog', 'Vanadinite', 'Alternium', 'Viverra', 'Poiseon', 'Polonium', 'Vitrilyx', 'Euclideum', 'Scarfyte', 'Exoretic', 'Albinite', 'Magnetyx', 'Glitzar', 'Scribbal'],
  outer_core: ['Magma', 'Bedrock', 'Nickel', 'Sulfur', 'Gold', 'Manganese', 'Palladium', 'Simbercite', 'Serandite', 'Magnesium', 'Core Fragment', 'Pyromorphite', 'Incinderium', 'Sunstone', 'Heliostra', 'Solarite', 'Thundarian', 'Flaeon', 'Combustal', 'Bonfire', 'Suncindium', 'Cleopatrite', 'Xynarium', 'Dyronsinite', 'Gargantium', 'Dynamo of Fate'],
  inner_core: ['Magma', 'Bedrock', 'Nickel', 'Sulfur', 'Gold', 'Manganese', 'Palladium', 'Simbercite', 'Serandite', 'Magnesium', 'Core Fragment', 'Pyromorphite', 'Incinderium', 'Sunstone', 'Heliostra', 'Solarite', 'Flaeon', 'Accretium', 'Combustal', 'Emberstyx', 'Cleopatrite', 'Vulkavium', 'Ω', "Elbrus' Pride", 'Chrysalis'],
};

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'celestial'];
const RARITY_COLORS = ['#9a9a94', '#73b5a6', '#5d9eff', '#bd76e8', '#f2c14e', '#ec5f88', '#fff6d8'];
const RARITY_VALUES = [1, 5, 20, 75, 300, 1500, 10000];

export function oreId(name) {
  if (name === 'Ω') return 'omega';
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function rarityForRank(rank, length) {
  return RARITIES[Math.min(RARITIES.length - 1, Math.floor((rank / Math.max(1, length - 1)) * RARITIES.length))];
}

const firstAppearance = new Map();
for (const names of Object.values(ORE_NAMES_BY_LAYER)) {
  names.forEach((name, rank) => {
    if (!firstAppearance.has(oreId(name))) firstAppearance.set(oreId(name), { name, rank, length: names.length });
  });
}

export const ORES = [...firstAppearance.entries()].map(([id, entry]) => {
  const rarity = rarityForRank(entry.rank, entry.length);
  const rarityIndex = RARITIES.indexOf(rarity);
  return {
    id,
    name: entry.name,
    oddsOneIn: Math.max(1, Math.round(1.65 ** entry.rank)),
    rarity,
    color: RARITY_COLORS[rarityIndex],
    value: RARITY_VALUES[rarityIndex] * (1 + Math.floor(entry.rank / 5)),
    tradeable: true,
    flavor: `${rarity[0].toUpperCase()}${rarity.slice(1)} material from Natura.`,
  };
});

export const ORES_BY_ID = Object.fromEntries(ORES.map((ore) => [ore.id, ore]));
export const ORE_IDS_BY_LAYER = Object.fromEntries(
  Object.entries(ORE_NAMES_BY_LAYER).map(([layerId, names]) => [layerId, names.map(oreId)]),
);