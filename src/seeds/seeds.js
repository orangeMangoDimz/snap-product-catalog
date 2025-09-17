const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const Logger = require("../utils/logger");

(async () => {
    const dbPath = path.join(__dirname, "../../data/database.sqlite");

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        Logger.info("Database connection established");

        Logger.info("Drop all records from products table");

        await db.exec(`
            DELETE FROM products;
          `);

        Logger.info("Create products table if not exists");

        await db.exec(`
            CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

        const stmt = await db.prepare(
            "INSERT OR IGNORE INTO products (id, name, price, category, image_url, description) VALUES (?, ?, ?, ?, ?, ?)"
        );

        let changes = 0;
        for (let i = 1; i <= 500; i++) {
            const dummyProduct = {
                id: i,
                name: `Product ${i}`,
                price: Math.floor(Math.random() * 100000),
                category: `Category ${i}`,
                image_url: `https://via.placeholder.com/150`,
                description:
                    randomDescription[
                        Math.floor(Math.random() * randomDescription.length)
                    ],
            };

            const result = await stmt.run(
                dummyProduct.id,
                dummyProduct.name,
                dummyProduct.price,
                dummyProduct.category,
                dummyProduct.image_url,
                dummyProduct.description
            );

            changes += result.changes;
        }

        Logger.info(`Seeding complete. Inserted ${changes} new rows`);
        await stmt.finalize();
        await db.close();
    } catch (error) {
        Logger.error(`Seeding failed: ${error.message}`);
        process.exit(1);
    }
})();

// Keep description length between 200 and 500 words
const randomDescription = [
    `
  Immerse yourself in a world of pure, uninterrupted audio with the new AuraSound Pro Wireless Headphones. Engineered for the discerning audiophile and the busy professional, these headphones deliver an unparalleled listening experience. Our state-of-the-art active noise-cancellation (ANC) technology intelligently scans your environment and eliminates ambient sounds, from the low rumble of a jet engine to the distracting chatter of a busy cafe. This leaves you with nothing but rich, high-fidelity sound. The custom-tuned 40mm neodymium drivers produce a breathtakingly wide soundstage, with deep, resonant bass, crystal-clear mids, and sparkling highs. Every note is rendered with stunning precision, allowing you to hear your favorite music exactly as the artist intended.
  Crafted from premium, lightweight materials, the AuraSound Pro is designed for all-day comfort. The plush, memory foam earcups gently contour to your ears, while the adjustable, padded headband ensures a secure yet comfortable fit, even during extended listening sessions. With a remarkable battery life of up to 40 hours on a single charge (25 with ANC activated), you can power through multiple workdays or long-haul flights without interruption. And when you're in a hurry, a quick 10-minute charge provides an impressive 5 hours of playback.
  Connectivity is seamless with Bluetooth 5.2, offering a stable, low-latency connection to all your devices. The integrated, beamforming microphone array ensures your voice is captured with exceptional clarity during calls, making remote meetings and catch-ups with loved ones feel more personal. Intuitive on-ear controls allow you to manage your music, answer calls, and access your voice assistant with a simple touch. The headphones also come with a durable, hardshell travel case, a USB-C charging cable, and a 3.5mm audio cable for wired listening. Elevate your audio experience and find your focus with AuraSound Pro.
  `,

    `
  Revolutionize your morning routine with the BrewMaster Connect, the intelligent coffee maker that brews the perfect cup, tailored just for you, before you even get out of bed. This isn't just a coffee machine; it's your personal barista. Using the intuitive smartphone app (available for iOS and Android), you can schedule brewing times, customize the strength and temperature of your coffee, and even select the grind size. Wake up to the irresistible aroma of freshly brewed coffee, made exactly to your specifications. The BrewMaster Connect is compatible with Alexa and Google Assistant, allowing you to start your brew with a simple voice command.
  At the heart of the BrewMaster Connect is a precision burr grinder that ensures a consistent and uniform grind every time, unlocking the full flavor profile of your favorite beans. The innovative water heating system maintains a precise and stable temperature throughout the brewing process, a critical element for optimal flavor extraction. The 12-cup, double-walled thermal carafe keeps your coffee hot and fresh for hours without the burnt taste often associated with traditional heating plates.
  The sleek, stainless steel design adds a touch of modern elegance to any kitchen countertop. The large, easy-to-read LCD screen provides real-time feedback on the brewing process, and the user-friendly interface makes manual operation a breeze. Cleaning is just as smart as brewing, with an automated self-cleaning cycle and dishwasher-safe components. The 'Keep Warm' function ensures your second cup is as perfect as the first. Stop settling for mediocre coffee. With the BrewMaster Connect, you can enjoy a gourmet coffee experience every single day, effortlessly. It’s the smarter way to start your day.
  `,

    `
  Transform your workspace into a haven of comfort and productivity with the ErgoFlex Pro Ergonomic Office Chair. Designed to support your body through long hours of work, this chair is a masterclass in ergonomic engineering. The core of its design is the dynamic lumbar support system, which automatically adjusts to the curve of your spine, promoting healthy posture and reducing lower back strain. The high-density, molded foam seat cushion provides a perfect balance of softness and support, evenly distributing your weight to alleviate pressure points and improve circulation.
  Every aspect of the ErgoFlex Pro is fully adjustable to create a personalized seating experience. The 4D armrests can be moved up, down, forward, back, and pivoted inwards or outwards, ensuring your arms and shoulders are always in a relaxed, natural position. The synchronized tilt mechanism allows the backrest and seat to move in harmony, providing continuous support as you recline. You can lock the recline angle in multiple positions or use the tension control to adjust the resistance to your preference. The seat height and depth are also easily adjustable, accommodating users of all sizes.
  The breathable, mesh backrest allows for optimal airflow, keeping you cool and comfortable throughout the workday. This advanced mesh material is also incredibly durable and flexible, conforming to your movements while providing firm support. The chair is built on a robust, polished aluminum base and features smooth-rolling, blade-style casters that glide effortlessly across any flooring surface, from hardwood to carpet, without causing damage. Assembling the ErgoFlex Pro is straightforward and takes only minutes, with all necessary tools and instructions included. Invest in your well-being and elevate your performance. The ErgoFlex Pro isn't just a chair; it's an essential tool for the modern professional who values both health and productivity.
  `,

    `
  Unleash true energy independence with the Volta 1200 Portable Power Station, your reliable source of power for any adventure or emergency. Whether you're camping off-grid, hosting an outdoor event, or preparing for an unexpected power outage, the Volta 1200 has the capacity and versatility to keep your essential devices running. With a massive 1228Wh LiFePO4 battery, it can power everything from smartphones and laptops to mini-fridges, medical devices (like CPAP machines), and even power tools. The advanced LiFePO4 battery chemistry offers a longer lifespan (over 3000 charge cycles) and enhanced safety compared to traditional lithium-ion batteries, giving you peace of mind.
  The Volta 1200 is equipped with a comprehensive array of output ports to meet all your power needs. It features three 110V pure sine wave AC outlets (1200W rated, 2400W surge), which deliver clean, stable power that is safe for sensitive electronics. It also includes two 100W USB-C PD ports for fast-charging modern laptops and tablets, two USB-A ports, a 12V carport, and two DC outputs. You can charge up to 10 devices simultaneously, making it a central power hub for your family or group.
  Recharging the Volta 1200 is flexible and convenient. Use a standard wall outlet to fully recharge in under 2 hours, thanks to its fast-charging technology. When you're off-grid, harness the power of the sun by connecting compatible solar panels (sold separately) for a sustainable, eco-friendly energy solution. You can also recharge it from your vehicle's 12V outlet while on the move. The large, clear LCD screen provides real-time data on battery level, input/output wattage, and remaining runtime, so you always know your power status. Built with a rugged, durable shell and an easy-carry handle, the Volta 1200 is engineered for portability and reliability, ensuring you have power whenever and wherever you need it.
  `,

    `
  Experience the joy of growing your own fresh, flavorful herbs, vegetables, and flowers year-round, right in your own home, with the FloraGrow Smart Garden. This innovative, self-contained hydroponic system makes gardening effortless and accessible to everyone, regardless of experience or available space. Forget about soil, mess, and guesswork. The FloraGrow uses a water-based nutrient solution to deliver everything your plants need to thrive, resulting in faster growth, bigger yields, and more nutritious produce compared to traditional gardening.
  The system is built around a full-spectrum, 36W LED grow light that mimics natural sunlight, providing the optimal light recipe to stimulate photosynthesis and promote healthy, robust growth. The light panel is height-adjustable, allowing it to grow along with your plants, from tiny seedlings to full maturity. An automatic timer ensures your plants receive the perfect amount of light each day (16 hours on, 8 hours off), so you can set it and forget it. The large, 4.5-liter water reservoir means you only need to add water every 2-3 weeks, and the system's control panel will automatically alert you when it's time to add more water or the patented liquid nutrients (a starter kit is included).
  The FloraGrow Smart Garden can grow up to 12 plants at once, and it comes with a gourmet herb seed pod kit, including Genovese Basil, Curly Parsley, Dill, Thyme, Thai Basil, and Mint. Setting it up is incredibly simple and takes just minutes, with no tools required. Its sleek, modern design makes it a beautiful addition to any kitchen, living room, or office. Enjoy the taste of homegrown freshness in your salads, sauces, and cocktails. The FloraGrow is more than just a garden; it's a sustainable way to bring nature indoors and elevate your culinary creations.
  `,
    `
  Unleash your inner chef and elevate your culinary creations with the Vortex Pro High-Performance Blender. This is not your average blender; it's a powerhouse appliance designed to handle the toughest ingredients with ease, delivering perfectly smooth and consistent results every time. At its core is a formidable 2.5 peak horsepower motor that spins the hardened stainless-steel blades at over 30,000 RPM. This incredible power allows you to pulverize ice into snow in seconds, blend silky-smooth soups from hard vegetables, grind nuts into creamy butters, and create velvety smoothies without any grit or chunks.
  The Vortex Pro features a durable, 64-ounce, BPA-free Tritan container, which is shatterproof and large enough to handle family-sized batches. Its unique vortex-creating shape systematically folds ingredients back down towards the blades for faster, more efficient blending. The variable speed control dial gives you complete command over the texture of your creations, from a gentle stir to a high-speed puree. For ultimate convenience, the blender is equipped with five pre-programmed settings for Smoothies, Hot Soups, Dips & Spreads, Frozen Desserts, and Self-Cleaning. The Hot Soup function is particularly revolutionary, as the friction from the blades can heat fresh ingredients to a steaming-hot temperature in about six minutes.
  Safety and convenience are paramount. The spill-proof, vented lid allows you to blend hot liquids safely, and the included tamper helps you process thick, stubborn mixtures without stopping the machine. When you're finished, simply add a drop of dish soap and some warm water to the container and run the Self-Cleaning cycle for 60 seconds for a spotless finish, no disassembly required. The robust, all-metal drive system ensures durability and longevity, making the Vortex Pro a lasting investment in your kitchen and your health. From morning smoothies to gourmet sauces, this blender empowers you to explore new recipes and achieve professional-quality results at home.
  `,
];
