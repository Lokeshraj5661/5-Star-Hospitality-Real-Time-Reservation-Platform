// Catalogue of all dishes across categories.
// IDs are stable, used as data-testid suffixes.

const D = (p) => `/dishes/${p}.png`;

// Original hosted images (from initial design agent run)
const HOSTED_DOSA = "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/c66de5f4608703aa18be858a23ab3e55f5214ddbe7aa1dc0b53867a2df38183f.png";
const HOSTED_IDLI = "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/90ecae5b7f75b6e81bb41252c92d2dd2d40d3d5336d49e5a1b4bf115c9cc694b.png";
const HOSTED_THALI = "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/937c3d12087057598417171b00c5a42c6e5d49d3e5b3349b3475878308e04e79.png";

export const DISHES = [
  // Breakfasts
  { id: "idli", category: "breakfast", name: "Cloud Idli", sanskrit: "इडली",
    desc: "Porous cloud-soft white rice cakes steamed by sunrise, served with coconut, tomato and gunpowder chutneys.",
    price: 80, chef: "Heritage", image: D("idli"), tags: ["Veg", "Steamed"] },
  { id: "vada", category: "breakfast", name: "Medu Vada Royale", sanskrit: "मेदु वड़ा",
    desc: "Golden-brown crispy lentil donut with visible cracked peppercorns and curry leaves, paired with a brushed-gold bowl of coconut chutney.",
    price: 70, chef: "Crisp", image: D("vada"), tags: ["Veg", "Fried"] },
  { id: "dosa", category: "breakfast", name: "Crystal Masala Dosa", sanskrit: "मसाला डोसा",
    desc: "Twenty-four-hour fermented batter, ghee-roasted to lace, folded over a fragrant potato masala.",
    price: 120, chef: "Signature", image: HOSTED_DOSA, tags: ["Veg"] },
  { id: "pongal", category: "breakfast", name: "Ven Pongal", sanskrit: "वेन पोंगल",
    desc: "Rice and moong dal, peppered, ghee-laden — a winter morning in a brass bowl.",
    price: 110, chef: "Comfort", image: D("pongal"), tags: ["Veg"] },
  { id: "upma", category: "breakfast", name: "Rava Upma", sanskrit: "उपमा",
    desc: "Roasted semolina, mustard seed, cashew, served with a sliver of lime.",
    price: 90, chef: "Daily", image: D("upma"), tags: ["Veg"] },

  // Indo-Chinese
  { id: "gobi-manchurian", category: "indochinese", name: "Gobi Manchurian", sanskrit: "गोबी मंचूरियन",
    desc: "Crisped cauliflower lacquered in a glossy soy-chilli glaze, scattered with vibrant scallion ribbons.",
    price: 160, chef: "Wok · Signature", image: D("gobi_manchurian"), tags: ["Veg", "Spicy"] },
  { id: "gobi-rice", category: "indochinese", name: "Gobi Fried Rice", sanskrit: "गोबी राइस",
    desc: "Ring-moulded basmati, wok-kissed amber, embedded with dark-glazed gobi and micro-diced vegetables.",
    price: 150, chef: "Wok", image: D("gobi_fried_rice"), tags: ["Veg"] },
  { id: "egg-rice", category: "indochinese", name: "Egg Fried Rice", sanskrit: "एग राइस",
    desc: "Minimalist wok-fried rice with bright yellow scrambled egg ribbons and a sheen of sesame oil.",
    price: 140, chef: "Wok", image: D("egg_fried_rice"), tags: ["Egg"] },
  { id: "egg-gobi-rice", category: "indochinese", name: "Egg & Gobi Fried Rice", sanskrit: "एग गोबी राइस",
    desc: "Soft yellow egg ribbons folded through wok-tossed rice with deeply caramelised gobi florets.",
    price: 180, chef: "Dual Texture", image: D("egg_gobi_fried_rice"), tags: ["Egg"] },
  { id: "egg-noodles", category: "indochinese", name: "Egg Hakka Noodles", sanskrit: "एग नूडल्स",
    desc: "Slender Hakka noodles tossed with matchstick cabbage, carrot, pepper and golden egg shreds.",
    price: 150, chef: "Hakka", image: D("egg_noodles"), tags: ["Egg"] },
  { id: "gobi-noodles", category: "indochinese", name: "Gobi Hakka Noodles", sanskrit: "गोबी नूडल्स",
    desc: "Hakka noodles woven around deeply glazed gobi florets — pale strands, dark-crimson contrast.",
    price: 160, chef: "Hakka · Signature", image: D("gobi_noodles"), tags: ["Veg"] },

  // Biryanis
  { id: "veg-biryani", category: "biryani", name: "Hyderabadi Veg Biryani", sanskrit: "वेज बिरयानी",
    desc: "Saffron-streaked basmati layered with caramelised onions, paneer, peas and whole spices — served in a brass handi.",
    price: 220, chef: "Dum · Signature", image: D("veg_biryani"), tags: ["Veg"] },
  { id: "egg-biryani", category: "biryani", name: "Egg Dum Biryani", sanskrit: "एग बिरयानी",
    desc: "Saffron basmati crowned with two glistening halved eggs in golden masala, mint and birista.",
    price: 200, chef: "Dum", image: D("egg_biryani"), tags: ["Egg"] },

  // Desserts
  { id: "gulab-jamun", category: "dessert", name: "Gulab Jamun", sanskrit: "गुलाब जामुन",
    desc: "Three amber dumplings in glossy sugar syrup, kissed with saffron and slivered pistachio.",
    price: 90, chef: "Sweet · Royal", image: D("gulab_jamun"), tags: ["Sweet"] },
  { id: "rasgulla", category: "dessert", name: "Rasgulla", sanskrit: "रसगुल्ला",
    desc: "Snow-white spongy chhena spheres in clear sugar syrup, dusted with crushed pistachio and a rose petal.",
    price: 80, chef: "Sweet", image: D("rasgulla"), tags: ["Sweet"] },

  // Curries
  { id: "paneer-butter-masala", category: "curry", name: "Paneer Butter Masala", sanskrit: "पनीर मक्खनी",
    desc: "Soft paneer cubes in a velvety tomato-cream gravy, finished with butter and fenugreek.",
    price: 220, chef: "House Special", image: D("paneer_butter_masala"), tags: ["Veg", "Rich"] },
  { id: "veg-kurma", category: "curry", name: "Veg Kurma", sanskrit: "वेज कुर्मा",
    desc: "Mixed vegetables in pale-gold coconut gravy with curry-leaf tempering.",
    price: 180, chef: "Classic", image: D("veg_kurma"), tags: ["Veg"] },

  // Salads
  { id: "green-salad", category: "salad", name: "Garden Salad", sanskrit: "हरा सलाद",
    desc: "Crisp cucumber, tomato, red onion and carrot with a squeeze of lime and mint.",
    price: 60, chef: "Fresh", image: D("green_salad"), tags: ["Veg", "Cold"] },
  { id: "fruit-salad", category: "salad", name: "Fruit Bowl", sanskrit: "फ्रूट सलाद",
    desc: "Mango, pineapple, watermelon, kiwi and pomegranate in a frosted crystal goblet.",
    price: 110, chef: "Fresh", image: D("fruit_salad"), tags: ["Veg", "Cold"] },

  // Ice Creams
  { id: "vanilla-ic", category: "icecream", name: "Vanilla Bean", sanskrit: "वनीला",
    desc: "Two pristine vanilla bean scoops in a frosted crystal cup, caramel drizzle and a tuile.",
    price: 90, chef: "Cold", image: D("vanilla_ice_cream"), tags: ["Sweet", "Cold"] },
  { id: "mango-ic", category: "icecream", name: "Alphonso Mango", sanskrit: "आम",
    desc: "Vibrant mango scoops with fresh fruit chunks and mango coulis.",
    price: 110, chef: "Cold · Seasonal", image: D("mango_ice_cream"), tags: ["Sweet", "Cold"] },

  // Drinks
  { id: "filter", category: "drink", name: "Filter Coffee", sanskrit: "कापी",
    desc: "Chicory-laced, frothed at altitude, poured davarah-to-tumbler in brushed brass.",
    price: 40, chef: "Eternal", image: D("filter_coffee"), tags: ["Hot"] },
  { id: "badam-milk", category: "drink", name: "Saffron Badam Milk", sanskrit: "बादाम दूध",
    desc: "Creamy saffron almond milk with slivered pistachio in a brushed-gold tumbler.",
    price: 70, chef: "Warm", image: D("badam_milk"), tags: ["Hot"] },
  { id: "soft-drink", category: "drink", name: "Crystal Cola", sanskrit: "कोला",
    desc: "Chilled cola in a faceted crystal glass, lime wedge and a brushed-gold stirrer.",
    price: 50, chef: "Cold", image: D("soft_drink"), tags: ["Cold"] },
];

export const CATEGORIES = [
  { id: "breakfast", label: "Breakfasts" },
  { id: "indochinese", label: "Indo-Chinese" },
  { id: "biryani", label: "Biryanis" },
  { id: "curry", label: "Curries" },
  { id: "dessert", label: "Desserts" },
  { id: "salad", label: "Salads" },
  { id: "icecream", label: "Ice Creams" },
  { id: "drink", label: "Drinks" },
];
