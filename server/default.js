import Product from "./model/product-schema.js";
import { products } from "./constants/data.js";

const defaultData = async () => {
  try {
    // Check if default products already exist
    const existingCount = await Product.countDocuments({ id: { $in: products.map(p => p.id) } });
    if (existingCount === products.length) {
      console.log("Default products already exist, skipping seeding");
      return;
    }

    // Remove existing default products and re-insert
    await Product.deleteMany({ id: { $in: products.map(p => p.id) } });
    await Product.insertMany(products);
    console.log("Default data imported successfully");
  } catch (error) {
    console.error("Error while seeding default data:", error.message);
  }
};

export default defaultData;

