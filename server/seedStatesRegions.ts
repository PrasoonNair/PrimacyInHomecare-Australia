import { db } from './db';
import { states, regions } from '@shared/schema';

// Australian States and Territories with comprehensive regional data
const statesData = [
  { name: 'New South Wales', abbreviation: 'NSW', type: 'state' },
  { name: 'Victoria', abbreviation: 'VIC', type: 'state' },
  { name: 'Queensland', abbreviation: 'QLD', type: 'state' },
  { name: 'Western Australia', abbreviation: 'WA', type: 'state' },
  { name: 'South Australia', abbreviation: 'SA', type: 'state' },
  { name: 'Tasmania', abbreviation: 'TAS', type: 'state' },
  { name: 'Australian Capital Territory', abbreviation: 'ACT', type: 'territory' },
  { name: 'Northern Territory', abbreviation: 'NT', type: 'territory' },
];

const regionsData = [
  // New South Wales regions
  { stateName: 'New South Wales', name: 'Sydney Metropolitan', postcodeLow: '2000', postcodeHigh: '2249', description: 'Greater Sydney area including CBD, Inner West, North Shore, Eastern Suburbs', majorTowns: ['Sydney', 'Parramatta', 'Manly', 'Bondi'] },
  { stateName: 'New South Wales', name: 'Hunter Valley', postcodeLow: '2250', postcodeHigh: '2339', description: 'Newcastle, Lake Macquarie, and surrounding coal mining regions', majorTowns: ['Newcastle', 'Cessnock', 'Maitland', 'Singleton'] },
  { stateName: 'New South Wales', name: 'Illawarra', postcodeLow: '2500', postcodeHigh: '2590', description: 'Wollongong and coastal areas south of Sydney', majorTowns: ['Wollongong', 'Port Kembla', 'Kiama', 'Shellharbour'] },
  { stateName: 'New South Wales', name: 'Central Coast', postcodeLow: '2250', postcodeHigh: '2263', description: 'Coastal region between Sydney and Newcastle', majorTowns: ['Gosford', 'Wyong', 'Terrigal', 'The Entrance'] },
  { stateName: 'New South Wales', name: 'Blue Mountains', postcodeLow: '2745', postcodeHigh: '2786', description: 'Mountain region west of Sydney', majorTowns: ['Katoomba', 'Leura', 'Blackheath', 'Mount Victoria'] },
  { stateName: 'New South Wales', name: 'Central West', postcodeLow: '2790', postcodeHigh: '2899', description: 'Inland regions including Bathurst, Orange, and Dubbo', majorTowns: ['Bathurst', 'Orange', 'Dubbo', 'Mudgee'] },
  { stateName: 'New South Wales', name: 'North Coast', postcodeLow: '2340', postcodeHigh: '2490', description: 'Coastal areas from Port Macquarie to Tweed Heads', majorTowns: ['Coffs Harbour', 'Byron Bay', 'Lismore', 'Grafton'] },
  { stateName: 'New South Wales', name: 'South Coast', postcodeLow: '2535', postcodeHigh: '2551', description: 'Coastal areas south of Wollongong', majorTowns: ['Batemans Bay', 'Narooma', 'Merimbula', 'Eden'] },
  { stateName: 'New South Wales', name: 'Riverina', postcodeLow: '2590', postcodeHigh: '2717', description: 'Agricultural region in southern NSW', majorTowns: ['Wagga Wagga', 'Albury', 'Griffith', 'Leeton'] },
  { stateName: 'New South Wales', name: 'New England', postcodeLow: '2340', postcodeHigh: '2411', description: 'Tablelands region in northern NSW', majorTowns: ['Armidale', 'Tamworth', 'Glen Innes', 'Inverell'] },
  { stateName: 'New South Wales', name: 'Far West', postcodeLow: '2717', postcodeHigh: '2898', description: 'Remote inland regions including mining areas', majorTowns: ['Broken Hill', 'Cobar', 'Bourke', 'Lightning Ridge'] },

  // Victoria regions
  { stateName: 'Victoria', name: 'Melbourne Metropolitan', postcodeLow: '3000', postcodeHigh: '3199', description: 'Greater Melbourne area including CBD and inner suburbs', majorTowns: ['Melbourne', 'Richmond', 'St Kilda', 'Brunswick'] },
  { stateName: 'Victoria', name: 'Geelong', postcodeLow: '3200', postcodeHigh: '3299', description: 'Geelong and Bellarine Peninsula', majorTowns: ['Geelong', 'Torquay', 'Queenscliff', 'Ocean Grove'] },
  { stateName: 'Victoria', name: 'Ballarat', postcodeLow: '3300', postcodeHigh: '3399', description: 'Central highlands region', majorTowns: ['Ballarat', 'Daylesford', 'Creswick', 'Bacchus Marsh'] },
  { stateName: 'Victoria', name: 'Bendigo', postcodeLow: '3400', postcodeHigh: '3499', description: 'Central Victoria goldfields region', majorTowns: ['Bendigo', 'Castlemaine', 'Kyneton', 'Heathcote'] },
  { stateName: 'Victoria', name: 'Gippsland', postcodeLow: '3800', postcodeHigh: '3996', description: 'Eastern Victoria including Latrobe Valley', majorTowns: ['Traralgon', 'Sale', 'Bairnsdale', 'Lakes Entrance'] },
  { stateName: 'Victoria', name: 'Western District', postcodeLow: '3200', postcodeHigh: '3399', description: 'Southwestern Victoria farming region', majorTowns: ['Warrnambool', 'Portland', 'Hamilton', 'Camperdown'] },
  { stateName: 'Victoria', name: 'Wimmera', postcodeLow: '3400', postcodeHigh: '3499', description: 'Northwestern Victoria wheat belt', majorTowns: ['Horsham', 'Stawell', 'Ararat', 'St Arnaud'] },
  { stateName: 'Victoria', name: 'Mallee', postcodeLow: '3500', postcodeHigh: '3599', description: 'Northwestern Victoria along Murray River', majorTowns: ['Mildura', 'Swan Hill', 'Robinvale', 'Ouyen'] },
  { stateName: 'Victoria', name: 'Hume', postcodeLow: '3600', postcodeHigh: '3799', description: 'Northeastern Victoria along Murray River', majorTowns: ['Albury-Wodonga', 'Shepparton', 'Echuca', 'Wangaratta'] },
  { stateName: 'Victoria', name: 'High Country', postcodeLow: '3700', postcodeHigh: '3799', description: 'Alpine regions and ski resorts', majorTowns: ['Mount Buller', 'Falls Creek', 'Mount Hotham', 'Bright'] },

  // Queensland regions
  { stateName: 'Queensland', name: 'Brisbane Metropolitan', postcodeLow: '4000', postcodeHigh: '4207', description: 'Greater Brisbane area and Moreton Bay', majorTowns: ['Brisbane', 'Ipswich', 'Logan', 'Redcliffe'] },
  { stateName: 'Queensland', name: 'Gold Coast', postcodeLow: '4207', postcodeHigh: '4275', description: 'Gold Coast and hinterland', majorTowns: ['Surfers Paradise', 'Southport', 'Robina', 'Burleigh Heads'] },
  { stateName: 'Queensland', name: 'Sunshine Coast', postcodeLow: '4550', postcodeHigh: '4581', description: 'Sunshine Coast and hinterland', majorTowns: ['Maroochydore', 'Noosa', 'Caloundra', 'Nambour'] },
  { stateName: 'Queensland', name: 'Toowoomba', postcodeLow: '4350', postcodeHigh: '4390', description: 'Darling Downs region', majorTowns: ['Toowoomba', 'Warwick', 'Dalby', 'Stanthorpe'] },
  { stateName: 'Queensland', name: 'Wide Bay', postcodeLow: '4570', postcodeHigh: '4671', description: 'Fraser Coast and Burnett regions', majorTowns: ['Hervey Bay', 'Maryborough', 'Bundaberg', 'Kingaroy'] },
  { stateName: 'Queensland', name: 'Central Queensland', postcodeLow: '4700', postcodeHigh: '4741', description: 'Rockhampton and coal mining regions', majorTowns: ['Rockhampton', 'Gladstone', 'Emerald', 'Blackwater'] },
  { stateName: 'Queensland', name: 'Mackay', postcodeLow: '4740', postcodeHigh: '4751', description: 'Mackay and Whitsunday regions', majorTowns: ['Mackay', 'Airlie Beach', 'Proserpine', 'Sarina'] },
  { stateName: 'Queensland', name: 'North Queensland', postcodeLow: '4800', postcodeHigh: '4871', description: 'Townsville and surrounding areas', majorTowns: ['Townsville', 'Charters Towers', 'Ayr', 'Bowen'] },
  { stateName: 'Queensland', name: 'Far North Queensland', postcodeLow: '4870', postcodeHigh: '4895', description: 'Cairns and tropical north', majorTowns: ['Cairns', 'Port Douglas', 'Mareeba', 'Atherton'] },
  { stateName: 'Queensland', name: 'Gulf Country', postcodeLow: '4820', postcodeHigh: '4825', description: 'Remote northwestern Queensland', majorTowns: ['Mount Isa', 'Cloncurry', 'Normanton', 'Burketown'] },
  { stateName: 'Queensland', name: 'Cape York', postcodeLow: '4875', postcodeHigh: '4895', description: 'Far northern peninsula', majorTowns: ['Weipa', 'Thursday Island', 'Cooktown', 'Laura'] },

  // Western Australia regions
  { stateName: 'Western Australia', name: 'Perth Metropolitan', postcodeLow: '6000', postcodeHigh: '6199', description: 'Greater Perth area and Fremantle', majorTowns: ['Perth', 'Fremantle', 'Joondalup', 'Rockingham'] },
  { stateName: 'Western Australia', name: 'Southwest', postcodeLow: '6200', postcodeHigh: '6399', description: 'Bunbury, Margaret River wine region', majorTowns: ['Bunbury', 'Margaret River', 'Busselton', 'Collie'] },
  { stateName: 'Western Australia', name: 'Great Southern', postcodeLow: '6330', postcodeHigh: '6399', description: 'Albany and southern agricultural region', majorTowns: ['Albany', 'Mount Barker', 'Denmark', 'Katanning'] },
  { stateName: 'Western Australia', name: 'Wheatbelt', postcodeLow: '6400', postcodeHigh: '6507', description: 'Central agricultural region', majorTowns: ['Northam', 'Merredin', 'Narrogin', 'York'] },
  { stateName: 'Western Australia', name: 'Mid West', postcodeLow: '6500', postcodeHigh: '6599', description: 'Geraldton and mining regions', majorTowns: ['Geraldton', 'Kalbarri', 'Dongara', 'Morawa'] },
  { stateName: 'Western Australia', name: 'Goldfields', postcodeLow: '6400', postcodeHigh: '6799', description: 'Kalgoorlie and gold mining region', majorTowns: ['Kalgoorlie', 'Boulder', 'Coolgardie', 'Esperance'] },
  { stateName: 'Western Australia', name: 'Pilbara', postcodeLow: '6700', postcodeHigh: '6799', description: 'Iron ore mining region', majorTowns: ['Karratha', 'Port Hedland', 'Newman', 'Tom Price'] },
  { stateName: 'Western Australia', name: 'Kimberley', postcodeLow: '6700', postcodeHigh: '6799', description: 'Remote northern region', majorTowns: ['Broome', 'Derby', 'Kununurra', 'Halls Creek'] },

  // South Australia regions
  { stateName: 'South Australia', name: 'Adelaide Metropolitan', postcodeLow: '5000', postcodeHigh: '5199', description: 'Greater Adelaide area and Adelaide Hills', majorTowns: ['Adelaide', 'Glenelg', 'Mount Barker', 'Stirling'] },
  { stateName: 'South Australia', name: 'Barossa Valley', postcodeLow: '5350', postcodeHigh: '5374', description: 'Wine region north of Adelaide', majorTowns: ['Tanunda', 'Nuriootpa', 'Angaston', 'Gawler'] },
  { stateName: 'South Australia', name: 'Fleurieu Peninsula', postcodeLow: '5200', postcodeHigh: '5259', description: 'Southern peninsula wine and tourism region', majorTowns: ['Victor Harbor', 'Mount Compass', 'Strathalbyn', 'Yankalilla'] },
  { stateName: 'South Australia', name: 'Murray Lands', postcodeLow: '5260', postcodeHigh: '5353', description: 'Murray River region', majorTowns: ['Murray Bridge', 'Mannum', 'Renmark', 'Loxton'] },
  { stateName: 'South Australia', name: 'Limestone Coast', postcodeLow: '5250', postcodeHigh: '5291', description: 'Southeast wine region', majorTowns: ['Mount Gambier', 'Millicent', 'Naracoorte', 'Penola'] },
  { stateName: 'South Australia', name: 'Yorke Peninsula', postcodeLow: '5550', postcodeHigh: '5583', description: 'Agricultural peninsula west of Adelaide', majorTowns: ['Kadina', 'Moonta', 'Wallaroo', 'Minlaton'] },
  { stateName: 'South Australia', name: 'Eyre Peninsula', postcodeLow: '5600', postcodeHigh: '5680', description: 'Western peninsula with Port Lincoln', majorTowns: ['Port Lincoln', 'Whyalla', 'Port Augusta', 'Ceduna'] },
  { stateName: 'South Australia', name: 'Outback', postcodeLow: '5700', postcodeHigh: '5799', description: 'Remote northern and western regions', majorTowns: ['Coober Pedy', 'Roxby Downs', 'Marree', 'Oodnadatta'] },

  // Tasmania regions
  { stateName: 'Tasmania', name: 'Greater Hobart', postcodeLow: '7000', postcodeHigh: '7199', description: 'Hobart and southern Tasmania', majorTowns: ['Hobart', 'Glenorchy', 'Kingston', 'New Norfolk'] },
  { stateName: 'Tasmania', name: 'Greater Launceston', postcodeLow: '7200', postcodeHigh: '7299', description: 'Launceston and northern Tasmania', majorTowns: ['Launceston', 'Devonport', 'Burnie', 'Ulverstone'] },
  { stateName: 'Tasmania', name: 'North West Coast', postcodeLow: '7300', postcodeHigh: '7399', description: 'Cradle Mountain and northwest coast', majorTowns: ['Devonport', 'Burnie', 'Wynyard', 'Stanley'] },
  { stateName: 'Tasmania', name: 'West Coast', postcodeLow: '7467', postcodeHigh: '7470', description: 'Remote mining region', majorTowns: ['Queenstown', 'Zeehan', 'Rosebery', 'Strahan'] },
  { stateName: 'Tasmania', name: 'East Coast', postcodeLow: '7190', postcodeHigh: '7216', description: 'Scenic eastern coastline', majorTowns: ['St Helens', 'Bicheno', 'Swansea', 'Triabunna'] },

  // Australian Capital Territory
  { stateName: 'Australian Capital Territory', name: 'Canberra', postcodeLow: '2600', postcodeHigh: '2618', description: 'National capital and surrounding areas', majorTowns: ['Canberra', 'Civic', 'Belconnen', 'Tuggeranong'] },

  // Northern Territory regions
  { stateName: 'Northern Territory', name: 'Greater Darwin', postcodeLow: '0800', postcodeHigh: '0899', description: 'Darwin and Palmerston', majorTowns: ['Darwin', 'Palmerston', 'Howard Springs', 'Humpty Doo'] },
  { stateName: 'Northern Territory', name: 'Alice Springs', postcodeLow: '0870', postcodeHigh: '0872', description: 'Central Australia region', majorTowns: ['Alice Springs', 'Tennant Creek', 'Katherine', 'Nhulunbuy'] },
  { stateName: 'Northern Territory', name: 'Arnhem Land', postcodeLow: '0880', postcodeHigh: '0885', description: 'Remote Aboriginal communities', majorTowns: ['Nhulunbuy', 'Maningrida', 'Ramingining', 'Yirrkala'] },
  { stateName: 'Northern Territory', name: 'Central Desert', postcodeLow: '0872', postcodeHigh: '0876', description: 'Remote central regions', majorTowns: ['Uluru', 'Yulara', 'Papunya', 'Santa Teresa'] },
];

export async function seedStatesAndRegions() {
  console.log('🌏 Seeding Australian states and regions...');

  try {
    // First, seed states
    console.log('📍 Adding states and territories...');
    for (const stateData of statesData) {
      await db.insert(states).values(stateData).onConflictDoNothing();
    }

    // Get all states for reference
    const allStates = await db.select().from(states);
    const stateMap = new Map(allStates.map(state => [state.name, state.id]));

    // Then, seed regions
    console.log('🗺️ Adding regions...');
    for (const regionData of regionsData) {
      const stateId = stateMap.get(regionData.stateName);
      if (stateId) {
        await db.insert(regions).values({
          name: regionData.name,
          stateId,
          postcodeLow: regionData.postcodeLow,
          postcodeHigh: regionData.postcodeHigh,
          description: regionData.description,
          majorTowns: regionData.majorTowns,
        }).onConflictDoNothing();
      }
    }

    console.log('✅ States and regions seeded successfully!');
    console.log(`📊 Added ${statesData.length} states/territories and ${regionsData.length} regions`);

  } catch (error) {
    console.error('❌ Error seeding states and regions:', error);
    throw error;
  }
}

// Export data for use in other parts of the system
export { statesData, regionsData };