const CAR_BRANDS = {
  'Ford':        ['Mustang', 'Falcon', 'Bronco', 'Maverick', 'Galaxy', 'Focus', 'Fiesta', 'Explorer'],
  'Toyota':      ['Supra', 'Celica', 'Corolla', 'Hilux', 'Prado', 'Yaris', 'Camry', 'Fortuner'],
  'Honda':       ['Civic', 'Accord', 'Prelude', 'Integra', 'CR-V', 'Jazz', 'Fit', 'CBR'],
  'BMW':         ['M3', 'M5', 'M8', 'Z4', 'X5', 'X7', 'Serie3', 'Serie5'],
  'Mercedes':    ['C63', 'E63', 'AMG GT', 'GLE', 'Clase A', 'Sprinter', 'EQS', 'Vito'],
  'Volkswagen':  ['Golf', 'Polo', 'Scirocco', 'Amarok', 'Passat', 'Tiguan', 'Gol', 'Vento'],
  'Audi':        ['R8', 'TT', 'RS6', 'S3', 'A4', 'A6', 'Q5', 'Q8'],
  'Chevrolet':   ['Camaro', 'Corvette', 'Blazer', 'S10', 'Cruze', 'Onix', 'Tracker', 'Equinox'],
  'Fiat':        ['500', 'Punto', 'Bravo', 'Tipo', 'Palio', 'Uno', 'Cronos', 'Argo'],
  'Renault':     ['Clio', 'Megane', 'Laguna', 'Sandero', 'Logan', 'Duster', 'Kwid', 'Symbol'],
  'Peugeot':     ['206', '208', '308', '408', '3008', '508', 'Partner', 'Boxer'],
  'Nissan':      ['GTR', '370Z', 'Frontier', 'Kicks', 'Sentra', 'Versa', 'X-Trail', 'Leaf'],
  'Ferrari':     ['F40', 'F50', 'Enzo', '458', '488', 'Roma', 'SF90', 'LaFerrari'],
  'Lamborghini': ['Diablo', 'Murcielago', 'Gallardo', 'Aventador', 'Huracan', 'Urus', 'Countach', 'Revuelto'],
  'Porsche':     ['911', 'Boxster', 'Cayman', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '918'],
  'Alfa Romeo':  ['Giulia', 'Stelvio', 'Spider', 'GTV', 'Brera', '4C', '147', '156'],
  'Jeep':        ['Wrangler', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Avenger', 'Meridian', 'Grand Cherokee'],
  'Subaru':      ['WRX', 'Impreza', 'BRZ', 'Outback', 'Forester', 'Legacy', 'XV', 'Crosstrek'],
  'Dodge':       ['Viper', 'Challenger', 'Charger', 'Durango', 'Ram', 'Dart', 'Neon', 'Journey'],
  'Hyundai':     ['Tucson', 'Santa Fe', 'Elantra', 'Kona', 'Ioniq', 'i30', 'Veloster', 'Accent'],
};

function getRandomCarName() {
  const brands = Object.keys(CAR_BRANDS);
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const models = CAR_BRANDS[brand];
  const model = models[Math.floor(Math.random() * models.length)];
  return `${brand} ${model}`;
}
