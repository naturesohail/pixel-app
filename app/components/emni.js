// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
function mergeProductsIntoAuctionZones(data) {
    const zones = data.config.auctionZones;
    const products = data.products;
  
    // Create a map of products grouped by zoneId
    const productMap = {};
    for (const product of products) {
      if (!productMap[product.zoneId]) {
        productMap[product.zoneId] = [];
      }
      productMap[product.zoneId].push(product);
    }
  
    // Merge products into corresponding auctionZones
    const updatedZones = zones.map(zone => {
      const [zoneProducts] = productMap[zone._id] || [];
      return {
        ...zone,
        products: zoneProducts
      };
    });
  
    // Return updated data structure
    return {
      ...data,
      config: {
        ...data.config,
        auctionZones: updatedZones
      }
    };
  }
  const bal={
      "success": true,
      "config": {
          "_id": "681d0daae4b33c99680bb19a",
          "pricePerPixel": 1,
          "oneTimePrice": 5,
          "totalPixels": 10000000,
          "availablePixels": 9999995,
          "minimumOrderQuantity": 5,
          "auctionWinDays": 2,
          "auctionZones": [
              {
                  "x": 18,
                  "y": 2,
                  "width": 22,
                  "height": 17,
                  "productIds": [],
                  "isEmpty": true,
                  "status": "active",
                  "buyNowPrice": 3.74,
                  "totalPixels": 374,
                  "pixelPrice": 0.01,
                  "_id": "681d0e01e4b33c99680bb1c1",
                  "bids": [],
                  "createdAt": "2025-05-08T20:03:13.975Z",
                  "updatedAt": "2025-05-08T20:03:13.975Z"
              }
          ],
          "createdAt": "2025-05-08T20:01:46.650Z",
          "updatedAt": "2025-05-08T21:08:15.771Z",
          "__v": 1
      },
      "products": [
          {
              "_id": "681d1d3f61312df5e4bea145",
              "title": "hbbh",
              "description": " b b",
              "price": 25,
              "images": [
                  "https://res.cloudinary.com/dtc1nqk9g/image/upload/v1746738494/pixel-products/6801e902e75e4b555a2367ce/nzlldkekukp9la3jy02u.jpg"
              ],
              "url": "",
              "owner": "6801e902e75e4b555a2367ce",
              "zoneId": "681d0e01e4b33c99680bb1c1",
              "status": "active",
              "purchaseType": "one-time",
              "expiryDate": "2026-05-08T21:08:15.643Z",
              "createdAt": "2025-05-08T21:08:15.650Z",
              "updatedAt": "2025-05-08T21:08:15.650Z",
              "__v": 0
          }
      ]
  }
  
  console.log(JSON.stringify(mergeProductsIntoAuctionZones(bal).config.auctionZones))