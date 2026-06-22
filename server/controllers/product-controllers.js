import Product from '../model/product-schema.js';
import { getCache, setCache } from '../config/redis.js';

export const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, page, limit } = req.query;
        
        const cacheKey = `products:query:${category || ''}_${minPrice || ''}_${maxPrice || ''}_${sort || ''}_${page || ''}_${limit || ''}`;
        
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        let query = {};
        if (category) {
            query['title.shortTitle'] = new RegExp(category, 'i');
        }
        
        if (minPrice || maxPrice) {
            query['price.cost'] = {};
            if (minPrice) query['price.cost'].$gte = Number(minPrice);
            if (maxPrice) query['price.cost'].$lte = Number(maxPrice);
        }
        
        let sortObj = {};
        if (sort === 'lowToHigh') sortObj['price.cost'] = 1;
        else if (sort === 'highToLow') sortObj['price.cost'] = -1;
        
        let responseData;

        if (page && limit) {
            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;
            const skip = (pageNum - 1) * limitNum;
            
            const products = await Product.find(query).sort(sortObj).skip(skip).limit(limitNum);
            const totalProducts = await Product.countDocuments(query);
            
            responseData = {
                products,
                currentPage: pageNum,
                totalPages: Math.ceil(totalProducts / limitNum),
                totalProducts
            };
        } else {
            responseData = await Product.find(query).sort(sortObj);
        }

        await setCache(cacheKey, responseData, 3600);

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error while fetching products", error);
        res.status(500).json({ message: "Error while fetching products" });
    }   
};


export const getProductById=async(req,res)=>{
    try{
      const id=req.params.id;
      const cacheKey = `product:${id}`;
      
      const cachedProduct = await getCache(cacheKey);
      if (cachedProduct) {
          return res.status(200).json(cachedProduct);
      }
      
      const product = await Product.findOne({'id':id});
      if (product) {
          await setCache(cacheKey, product, 3600);
      }
      res.status(200).json(product);
    }
    catch(error){
      res.status(500).json({ message: error.message});
    }
}

export const getSimilarProducts = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({ 'id': id });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        const category = product.title.shortTitle;
        const similarProducts = await Product.find({ 
            'title.shortTitle': category,
            'id': { $ne: id }
        }).limit(5);
        
        res.status(200).json(similarProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const importProducts = async (req, res) => {
    try {
        const apiResponse = await fetch('https://dummyjson.com/products?limit=30');
        const data = await apiResponse.json();

        if (!data || !data.products) {
            return res.status(400).json({ message: "Failed to fetch products from external API" });
        }

        const mappedProducts = data.products.map(item => {
            const costPrice = Math.round(item.price * 83);
            const mrpPrice = Math.round(costPrice * 1.25);

            return {
                id: `dummy_${item.id}`,
                url: item.thumbnail,
                detailUrl: item.images[0] || item.thumbnail,
                title: {
                    shortTitle: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'General',
                    longTitle: item.title
                },
                price: {
                    mrp: mrpPrice,
                    cost: costPrice,
                    discount: Math.round(item.discountPercentage) + '% Off'
                },
                quantity: item.stock || 10,
                description: item.description,
                discount: `${Math.round(item.discountPercentage)}% Off`,
                tagline: item.brand || 'Deal of the day'
            };
        });

        await Product.deleteMany({ id: { $regex: /^dummy_/ } });
        await Product.insertMany(mappedProducts);

        res.status(200).json({
            success: true,
            message: `${mappedProducts.length} products imported successfully from DummyJSON API!`,
            products: mappedProducts
        });

    } catch (error) {
        console.error("Error importing products:", error.message);
        res.status(500).json({ message: "Error importing products", error: error.message });
    }
};
