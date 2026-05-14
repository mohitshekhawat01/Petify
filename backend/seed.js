const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const categories = ['Dogs', 'Cats', 'Fish', 'Birds'];
const dogBadges = ['Best Seller', 'New Arrival', '10% Off', 'Vet Approved', null, null];
const catBadges = ['Best Seller', 'Trending', 'Sale', null, null];

// Name Generators
const dogFoodAdjectives = ['Grain-Free', 'High-Protein', 'Organic', 'Holistic', 'Hypoallergenic', 'Weight Management'];
const dogFoodMeats = ['Venison', 'Salmon & Sweet Potato', 'Grass-Fed Beef', 'Free-Range Chicken', 'Lamb & Brown Rice', 'Duck & Pumpkin'];
const dogFoodTypes = ['Kibble', 'Wet Food', 'Pâté', 'Raw Coated Kibble', 'Soft Chews', 'Jerky Treats'];

const dogAccAdjectives = ['Genuine Leather', 'Reflective', 'Heavy Duty', 'Tactical', 'Orthene', 'Designer'];
const dogAccNouns = ['Collar', 'Harness', 'Leash', 'Orthopedic Bed', 'Travel Carrier', 'Chew Toy'];

const catFoodAdjectives = ['Urinary Tract Health', 'Hairball Control', 'Indoor Kitten', 'Senior Diet', 'Grain-Free', 'Wild Caught'];
const catFoodMeats = ['Ocean Whitefish', 'Tuna & Salmon', 'Chicken Liver', 'Turkey Recipe', 'Trout Feast', 'Rabbit Pâté'];
const catFoodTypes = ['In Gravy', 'Flaked', 'Pâté', 'Shredded', 'Morsels', 'Dry Kibble'];

const catAccAdjectives = ['Multi-Level', 'Interactive', 'Laser', 'Plush', 'Sisal', 'Automatic'];
const catAccNouns = ['Scratching Post', 'Cat Tree', 'Feather Wand', 'Self-Cleaning Litter Box', 'Cozy Cave Bed', 'Catnip Kicker'];

const birdFoodAdjectives = ['Premium', 'Daily', 'High-Energy', 'Foraging', 'Molting', 'Vitamin-Enriched'];
const birdFoodSpecies = ['Parrot', 'Cockatiel', 'Canary', 'Lovebird', 'Macaw', 'Parakeet'];
const birdFoodTypes = ['Seed Mix', 'Pellets', 'Nut & Fruit Blend', 'Treat Sticks', 'Millet Spray'];

const birdAccAdjectives = ['Spacious', 'Interactive', 'Natural Wood', 'Stainless Steel', 'Acrobatic'];
const birdAccNouns = ['Flight Cage', 'Playstand', 'Foraging Toy', 'Rope Bungee', 'Cuttlebone', 'Bath'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getUniqueName = (adjectives, midwords, nouns, suffix = '') => {
    return `${pick(adjectives)} ${pick(midwords)} ${pick(nouns)} ${suffix}`.trim();
};

const generateProducts = () => {
    const products = [];

    // ── Image Pools (local — frontend/images/) ────────────────────

    // Dog food: 20 products — 8 unique images cycling
    const dogFoodImgs = [
        'images/dog-kibble.png',
        'images/dog-wet-food.png',
        'images/dog-pate.png',
        'images/dog-treats.png',
        'images/dog-jerky.png',
        'images/dog-soft-chews.png',
        'images/dog-raw-kibble.png',
        'images/dog-gravy.png',
    ];
    // Dog accessories: 20 products — 10 unique images cycling
    const dogAccImgs = [
        'images/dog-bed.png',
        'images/dog-carrier.png',
        'images/dog-collar.png',
        'images/dog-harness.png',
        'images/dog-leash.png',
        'images/dog-toy.png',
        'images/dog-bowl.png',
        'images/dog-brush.png',
        'images/dog-shampoo.png',
        'images/dog-bandana.png',
    ];
    // Cat food: 15 products — 6 unique images cycling
    const catFoodImgs = [
        'images/cat-kibble.png',
        'images/cat-gravy.png',
        'images/cat-pate.png',
        'images/cat-wet-food.png',
        'images/cat-treats.png',
        'images/cat-tuna.png',
    ];
    // Cat accessories: 15 products — 9 unique images cycling
    const catAccImgs = [
        'images/cat-bed.png',
        'images/cat-litter-box.png',
        'images/cat-scratch-post.png',
        'images/cat-tree.png',
        'images/cat-wand.png',
        'images/cat-bowl.png',
        'images/cat-collar.png',
        'images/cat-brush.png',
        'images/cat-tunnel.png',
    ];
    // Fish food: 10 products — 4 unique images cycling
    const fishFoodImgs = [
        'images/fish-food.png',
        'images/fish-flakes.png',
        'images/fish-pellets.png',
        'images/fish-koi-sticks.png',
    ];
    // Fish accessories: 10 products — 8 unique images
    const fishAccImgs = [
        'images/fish-filter.png',
        'images/fish-led-light.png',
        'images/fish-heater.png',
        'images/fish-air-pump.png',
        'images/fish-uv-sterilizer.png',
        'images/fish-co2-diffuser.png',
        'images/fish-wave-maker.png',
        'images/fish-bio-media.png',
    ];
    // Bird food: 8 products — 4 unique images cycling
    const birdFoodImgs = [
        'images/bird-seed.png',
        'images/bird-pellets.png',
        'images/bird-treat-sticks.png',
        'images/bird-millet.png',
    ];
    // Bird accessories: 7 products — 4 unique images cycling
    const birdAccImgs = [
        'images/bird-cage.png',
        'images/bird-playstand.png',
        'images/bird-rope-toy.png',
        'images/bird-perch.png',
    ];

    // ── DOG PRODUCTS (40) ──────────────────────────────────────────
    let dfIdx = 0, daIdx = 0;
    for (let i = 1; i <= 40; i++) {
        const isFood = i <= 20;
        const name = isFood
            ? getUniqueName(dogFoodAdjectives, dogFoodMeats, dogFoodTypes)
            : getUniqueName(dogAccAdjectives, dogAccNouns, ['Pro','Elite','Classic','Signature','Edition']);
        const image = isFood ? dogFoodImgs[dfIdx++ % dogFoodImgs.length] : dogAccImgs[daIdx++ % dogAccImgs.length];

        // Realistic Indian market prices
        const basePrice = isFood
            ? Math.floor(Math.random() * 500) + 149   // ₹149–₹649
            : Math.floor(Math.random() * 800) + 199;  // ₹199–₹999
        const oldPrice = Math.random() > 0.5 ? Math.floor(basePrice * (1.15 + Math.random() * 0.4)) : null;

        products.push({
            name,
            description: `A highly premium, vet-approved product for dogs. Ensures the highest quality of life for your furry friend, made with only the finest materials and ingredients.`,
            shortDescription: `Top tier ${isFood ? 'nutrition' : 'accessory'} for your dog.`,
            price: basePrice, oldPrice,
            category: 'Dogs',
            images: [image],
            emoji: isFood ? '🥩' : (i % 2 === 0 ? '🦮' : '🛏️'),
            brand: 'Petify Premium',
            countInStock: Math.floor(Math.random() * 50) + 5,
            rating: (Math.random() * 1 + 4).toFixed(1),
            numReviews: Math.floor(Math.random() * 200) + 10,
            badge: pick(dogBadges),
            keyFeatures: ['Vet Approved', 'Premium Quality', '100% Satisfaction Guaranteed'],
        });
    }

    // ── CAT PRODUCTS (30) ──────────────────────────────────────────
    let cfIdx = 0, caIdx = 0;
    for (let i = 1; i <= 30; i++) {
        const isFood = i <= 15;
        const name = isFood
            ? getUniqueName(catFoodAdjectives, catFoodMeats, catFoodTypes)
            : getUniqueName(catAccAdjectives, catAccNouns, ['Pro','Elite','Classic','Luxe','Edition']);
        const image = isFood ? catFoodImgs[cfIdx++ % catFoodImgs.length] : catAccImgs[caIdx++ % catAccImgs.length];

        const basePrice = isFood
            ? Math.floor(Math.random() * 400) + 99    // ₹99–₹499
            : Math.floor(Math.random() * 650) + 149;  // ₹149–₹799
        const oldPrice = Math.random() > 0.6 ? Math.floor(basePrice * (1.1 + Math.random() * 0.3)) : null;

        products.push({
            name,
            description: `Cats are picky, but they will absolutely love this. Crafted to satisfy even the most demanding feline companions.`,
            shortDescription: `Irresistible ${isFood ? 'meal' : 'toy'} for cats.`,
            price: basePrice, oldPrice,
            category: 'Cats',
            images: [image],
            emoji: isFood ? '🐟' : (i % 2 === 0 ? '🧸' : '🏰'),
            brand: 'Feline Fine',
            countInStock: Math.floor(Math.random() * 40) + 5,
            rating: (Math.random() * 1 + 4).toFixed(1),
            numReviews: Math.floor(Math.random() * 150) + 5,
            badge: pick(catBadges),
            keyFeatures: ['Irresistible', 'Durable', 'Safe for Cats'],
        });
    }

    // ── FISH PRODUCTS (20) ─────────────────────────────────────────
    const fishFoodNames = ['Tropical Flakes','Goldfish Pellets','Cichlid Crisps','Betta Pellets','Marine Flakes','Colour Enhancer Crisps','Pro Growth Pellets','Spirulina Flakes','Koi Sticks','Discus Granules'];
    const fishAccNames  = ['Canister Filter','Planted LED Light','Aquarium Heater','Silent Air Pump','UV Sterilizer','CO2 Diffuser','Wave Maker','Aquascape Rocks','Sponge Filter','Bio Media Kit'];

    let ffIdx = 0, faIdx = 0;
    for (let i = 0; i < 20; i++) {
        const isFood = i < 10;
        const basePrice = isFood
            ? Math.floor(Math.random() * 220) + 79
            : Math.floor(Math.random() * 550) + 149;

        products.push({
            name: `Premium ${isFood ? fishFoodNames[i] : fishAccNames[i - 10]}`,
            description: `Maintain a perfectly balanced aquatic environment. Crystal-clear water and healthy fish guaranteed.`,
            shortDescription: `Essential for your aquarium.`,
            price: basePrice,
            oldPrice: Math.random() > 0.6 ? Math.floor(basePrice * 1.2) : null,
            category: 'Fish',
            images: [isFood ? fishFoodImgs[ffIdx++ % fishFoodImgs.length] : fishAccImgs[faIdx++ % fishAccImgs.length]],
            emoji: isFood ? '🐡' : '🌊',
            brand: 'AquaPure',
            countInStock: Math.floor(Math.random() * 60) + 10,
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            numReviews: Math.floor(Math.random() * 80) + 2,
            badge: Math.random() > 0.7 ? 'Sale' : null,
            keyFeatures: ['Water Safe', 'Nutritious', 'Long Lasting'],
        });
    }

    // ── BIRD PRODUCTS (15) ─────────────────────────────────────────
    let bfIdx = 0, baIdx = 0;
    for (let i = 1; i <= 15; i++) {
        const isFood = i <= 8;
        const basePrice = isFood
            ? Math.floor(Math.random() * 250) + 99
            : Math.floor(Math.random() * 700) + 299;

        products.push({
            name: isFood
                ? getUniqueName(birdFoodAdjectives, birdFoodSpecies, birdFoodTypes)
                : getUniqueName(birdAccAdjectives, [''], birdAccNouns, `Habitat ${i}`),
            description: `Give your winged friends the best life. Nutrient-rich seeds and spacious homes for ultimate bird happiness.`,
            shortDescription: `Best for your feathered friend.`,
            price: basePrice,
            oldPrice: Math.random() > 0.6 ? Math.floor(basePrice * 1.25) : null,
            category: 'Birds',
            images: [isFood ? birdFoodImgs[bfIdx++ % birdFoodImgs.length] : birdAccImgs[baIdx++ % birdAccImgs.length]],
            emoji: isFood ? '🌾' : '🪶',
            brand: 'Avian Haven',
            countInStock: Math.floor(Math.random() * 30) + 5,
            rating: (Math.random() * 1 + 4).toFixed(1),
            numReviews: Math.floor(Math.random() * 60) + 5,
            badge: Math.random() > 0.8 ? 'Trending' : null,
            keyFeatures: ['All Natural', 'Enriching', 'Feather Safe'],
        });
    }

    return products;
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petify');
        console.log('MongoDB connected for seeding...');

        await Product.deleteMany();
        console.log('Cleared existing products.');

        const products = generateProducts();
        await Product.insertMany(products);

        console.log(`Successfully seeded ${products.length} products!`);
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
