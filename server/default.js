import Product from "./model/product-schema.js";
import { products } from "./constants/data.js";

const defaultData = async () => {
  try {
    // Force re-seeding default products to update quantities
    console.log("Seeding default products...");

    // Remove existing default products and re-insert
    await Product.deleteMany({ id: { $in: products.map(p => p.id) } });
    await Product.insertMany(products);
    console.log("Default data imported successfully");
  } catch (error) {
    console.error("Error while seeding default data:", error.message);
  }
};

export default defaultData;

