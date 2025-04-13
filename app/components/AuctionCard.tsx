"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  title: string;
  images: string[];
  pixelIndex: number;
  pixelCount: number;
}

interface Config {
  totalPixels: number;
  availablePixels: number;
}

export default function AuctionCard({
  config,
  products,
}: {
  config: Config;
  products: Product[];
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [renderedProducts, setRenderedProducts] = useState<Set<string>>(new Set());
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

  const pixelSize = 16;
  const cols = 1000;
  const rows = 1000;

  // Create product map and preload images
  const productMap = useRef<Record<number, Product>>({});
  
  // Preload product images
  const preloadImages = useCallback(() => {
    products.forEach(product => {
      if (!imageCache.current[product.images[0]]) {
        const img = new Image();
        img.src = product.images[0];
        imageCache.current[product.images[0]] = img;
      }
    });
  }, [products]);

  useEffect(() => {
    productMap.current = {};
    products.forEach(product => {
      for (let i = 0; i < product.pixelCount; i++) {
        productMap.current[product.pixelIndex + i] = product;
      }
    });
    preloadImages();
  }, [products, preloadImages]);

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;

    // Draw the grid background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines first (more efficient)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let col = 0; col <= cols; col++) {
      const x = col * pixelSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let row = 0; row <= rows; row++) {
      const y = row * pixelSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw products that have loaded
    products.forEach(product => {
      if (renderedProducts.has(product._id)) {
        for (let i = 0; i < product.pixelCount; i++) {
          const pixelIndex = product.pixelIndex + i;
          const row = Math.floor(pixelIndex / cols);
          const col = pixelIndex % cols;
          const x = col * pixelSize;
          const y = row * pixelSize;

          const img = imageCache.current[product.images[0]];
          if (img && img.complete) {
            ctx.drawImage(img, x, y, pixelSize, pixelSize);
            ctx.strokeStyle = '#4a90e2';
            ctx.strokeRect(x, y, pixelSize, pixelSize);
          }
        }
      }
    });
  }, [products, renderedProducts]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Check for loaded images periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newlyRendered = new Set<string>();
      let hasNew = false;
      
      products.forEach(product => {
        const img = imageCache.current[product.images[0]];
        if (img && img.complete && !renderedProducts.has(product._id)) {
          newlyRendered.add(product._id);
          hasNew = true;
        }
      });

      if (hasNew) {
        setRenderedProducts(prev => {
          const updated = new Set(prev);
          newlyRendered.forEach(id => updated.add(id));
          return updated;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [products, renderedProducts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const col = Math.floor(mouseX / pixelSize);
      const row = Math.floor(mouseY / pixelSize);
      const pixelIndex = row * cols + col;
      
      setHoverPosition({ x: e.clientX, y: e.clientY });
      setHoveredProduct(productMap.current[pixelIndex] || null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const col = Math.floor(mouseX / pixelSize);
      const row = Math.floor(mouseY / pixelSize);
      const pixelIndex = row * cols + col;
      
      const product = productMap.current[pixelIndex];
      if (product) router.push(`/product/${product._id}`);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [router]);

  return (
    <div className="col-lg-12">
      <div className="card million-dollar-style">
        <div className="card-body">
          <div className="position-relative">
            <div style={{ overflow: 'auto', maxHeight: '80vh' }}>
              <canvas
                ref={canvasRef}
                style={{ 
                  width: `${cols * pixelSize}px`,
                  height: `${rows * pixelSize}px`,
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                }}
                aria-label="Pixel grid"
              />
            </div>
            
            {hoveredProduct && (
              <div 
                className="pixel-tooltip"
                style={{
                  position: 'fixed',
                  left: `${hoverPosition.x + 20}px`,
                  top: `${hoverPosition.y + 20}px`,
                  zIndex: 1000,
                  background: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  border: '1px solid #4a90e2'
                }}
              >
                <h5>{hoveredProduct.title}</h5>
                {hoveredProduct.images.length > 0 && (
                  <img 
                    src={hoveredProduct.images[0]} 
                    alt={hoveredProduct.title}
                    style={{
                      width: '100%',
                      maxHeight: '150px',
                      objectFit: 'contain',
                      border: '1px solid #ddd'
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}