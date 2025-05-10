// Prepare the checkout payload
const payload = {
    products: [
      {
        id: "game-id-1",            // Using 'id' instead of 'productId' to match the schema
        name: "ML",
        image: "https://www.example.com/images/game1.png",
        imagePublicId: "public-id-1234",  // Optional: If you're storing Cloudinary IDs
        discount: "10%",            // Optional: If you have discounts
        description: "An exciting game",  // Optional: You can include descriptions
        price: 0.25,
        quantity: 1,
      },
      {
        id: "game-id-2",            // Using 'id' instead of 'productId'
        name: "ML",
        image: "https://www.example.com/images/game2.png",
        imagePublicId: "public-id-5678", // Optional: If you're storing Cloudinary IDs
        discount: "5%",             // Optional: If you have discounts
        description: "Another fun game",
        price: 0.25,
        quantity: 1,
      },
    ],
    currency: "USD",
  };
  