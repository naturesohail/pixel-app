export interface Product {
  _id: string;
  productName: string;
  categories: string;
  price: string;
  description: string;
  productStatus: string;
  image: any;

}

 export interface FeaturedProjectProps {
    className?: string; 
    properties: Product[];  

  }