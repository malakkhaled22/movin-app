export const PROPERTY_TYPES = [
    "Apartment", 
    "Villa", 
    "Chalet", 
    "Duplex", 
    "Hotel Apartment", 
    "Land", 
    "Penthouse", 
    "Townhouse", 
    "Twin House", 
    "iVilla"
];

export const AREAS_MAPPING: Record<string, string[]> = {
    "Cairo": [
        "Madinaty", "Hyde Park", "Palm Hills New Cairo", "Sarai", "Taj City", 
        "Mivida", "Mountain View Hyde Park", "City Gate", "Villette", "Sodic East", 
        "Al Burouj Compound", "Lake View Residence", "Eastown", "Swan Lake Residence", 
        "Stone Residence", "The Square", "Galleria Moon Valley", "L'avenir", 
        "Zed East", "District 5", "The Address East", "Cairo Festival City", 
        "Saada Compound", "Bloomfields", "The Icon Residence", "New Cairo City",
        "Nasr City", "Ard El Golf", "Zamalek", "Gardenia City Compound Nasr City"
    ],
    "Giza": [
        "O West", "Mountain View iCity October", "Badya Palm Hills", "New Giza", 
        "Village West", "October Plaza", "Palm Parks - Palm Hills", "Allegria", 
        "Al Khamayel city", "Mountain View 1.1", "The Crown", "Etapa", "The Estates", 
        "Palm Hills Golf Extension", "Six West", "Joulz", "Kayan", "Solana", 
        "Zayed Dunes", "Sun Capital", "Grand Heights", "Westown", "Beverly Hills",
        "Sheikh Zayed City", "Hadayek October", "Hadayek El Ahram", "Pyramids Hills"
    ],
    "North Coast": [
        "Marassi", "Silver Sands", "Fouka Bay", "Marsa Baghush", "Seashore", 
        "Almaza Bay", "Amwaj", "June", "Hacienda Bay", "Latin District", 
        "Caesar", "Soul North Coast", "Hacienda West", "Salt", "Cali Coast", 
        "Playa Resort", "Al Masyaf", "Hacienda Waters", "Jefaira", "Seashell", 
        "Swan Lake North Coast", "Direction White", "Ogami", "Hacienda Heneish", 
        "Koun", "D-Bay", "La Vista Bay", "Solare", "Mar Bay", "Zahra"
    ],
    "Red Sea": [
        "Mangroovy Residence", "Makadi Orascom Resort", "Mesca", "Makadi", 
        "Soma Breeze", "Storia Del Mare", "El Gouna", "Sahl Hasheesh Resort", 
        "Somabay", "Ancient Sands Resort", "Shedwan Resort", "Tawila El Gouna"
    ],
    "Suez": [
        "Azha", "IL Monte Galala", "Gaia", "Telal Al Sokhna", "Blumar", 
        "Murano Wadi Degla", "Aroma Residence", "Cape Bay Sokhna", "Piacera", 
        "Jebal El Sokhna", "Movenpick Sokhna", "Blue Blue"
    ],
    "Alexandria": [
        "Sawary", "Vee Sawari", "Alex West", "Valore Smouha", "Smouha", 
        "Antoniadis City Compound", "Kafr Abdo", "Roushdy", "Stanley Bridge"
    ],
    "Matrouh": [
        "Porto Matrouh", "Sia Lagoon", "Almaza Bay", "Ghazala Bay"
    ],
    "Sharqia": [
        "Obour City", "Stella Heliopolis", "Shorouk City", "Gardenia Al Obour"
    ],
    "South Sainai": [
        "Dahab", "Sharm El Sheikh", "La Hacienda", "Ras Sedr"
    ],
    "Qalyubia": [
        "Benha", "Obour City", "Aliva", "Noor City"
    ]
};