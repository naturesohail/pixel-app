"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

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
  auctionZones?: {
    _id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    productIds: string[];
    isEmpty: boolean;
    pixelIndices: number[];
    createdAt?: string;
    updatedAt?: string;
  }[];
}

interface AuctionZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  products: Product[];
  isEmpty: boolean;
  pixelIndices: number[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AuctionCard({
  config,
  products,

}: {
  config: Config;
  products: Product[];
}) 
{
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<AuctionZone | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [renderedProducts, setRenderedProducts] = useState<Set<string>>(new Set());
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const [auctionZones, setAuctionZones] = useState<AuctionZone[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<AuctionZone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.isAdmin;
  const pixelSize = 14;
  const cols = 250;
  const rows = 4000;

  const productMap = useRef<Record<number, Product>>({});
  const blockedPixels = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (config?.auctionZones) {
      const zones = config.auctionZones.map(zone => ({
        id: zone._id || `zone-${Date.now()}`,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        products: zone.productIds
          ? products.filter(p => zone.productIds.includes(p._id))
          : [],
        isEmpty: zone.isEmpty,
        pixelIndices: zone.pixelIndices,
        _id: zone._id,
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt
      }));
      setAuctionZones(zones);

      const newBlockedPixels = new Set<number>();
      config.auctionZones.forEach(zone => {
        zone.pixelIndices.forEach(index => {
          newBlockedPixels.add(index);
        });
      });
      blockedPixels.current = newBlockedPixels;
      drawCanvas();
    }
  }, [config, products]);

  const preloadImages = useCallback(() => {
    products.forEach((product) => {
      if (!imageCache.current[product.images[0]]) {
        const img = new Image();
        img.src = product.images[0];
        imageCache.current[product.images[0]] = img;
      }
    });
  }, [products]);

  
  const getPixelIndices = useCallback((x: number, y: number, width: number, height: number): number[] => {
    const indices: number[] = [];
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        indices.push(row * cols + col);
      }
    }
    return indices;
  }, []);

  const findProductsInArea = useCallback((x: number, y: number, width: number, height: number): Product[] => {
    const productSet = new Set<Product>();
    const indices = getPixelIndices(x, y, width, height);

    indices.forEach(index => {
      const product = productMap.current[index];
      if (product) {
        productSet.add(product);
      }
    });

    return Array.from(productSet);
  }, [getPixelIndices]);

  const isEmptyArea = useCallback((x: number, y: number, width: number, height: number): boolean => {
    const indices = getPixelIndices(x, y, width, height);
    return !indices.some(index =>
      productMap.current[index] ||
      blockedPixels.current.has(index)
    );
  }, [getPixelIndices]);

  const isAreaOverlapping = useCallback((x: number, y: number, width: number, height: number): boolean => {
    const newIndices = getPixelIndices(x, y, width, height);
    return auctionZones.some(zone =>
      zone.pixelIndices.some(index => newIndices.includes(index))
    );
  }, [getPixelIndices, auctionZones]);

  useEffect(() => {
    productMap.current = {};
    products.forEach((product: any) => {
      // Check if pixelIndices exists and is an array before iterating
      if (Array.isArray(product.pixelIndices)) {
        product.pixelIndices.forEach((index: any) => {
          productMap.current[index] = product;
        });
      } else if (product.pixelIndex !== undefined && product.pixelCount !== undefined) {
        // Fallback for older product format that might only have pixelIndex and pixelCount
        for (let i = 0; i < product.pixelCount; i++) {
          productMap.current[product.pixelIndex + i] = product;
        }
      }
    });
    preloadImages();
  }, [products, preloadImages]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;

    // 1. Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let col = 0; col <= cols; col++) {
      ctx.beginPath();
      ctx.moveTo(col * pixelSize, 0);
      ctx.lineTo(col * pixelSize, canvas.height);
      ctx.stroke();
    }
    for (let row = 0; row <= rows; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * pixelSize);
      ctx.lineTo(canvas.width, row * pixelSize);
      ctx.stroke();
    }

    // 3. Draw blocked pixels (blue background for all auction zone pixels)
    ctx.fillStyle = "rgba(20, 81, 171, 0.2)";
    if (config?.auctionZones) {
      config.auctionZones.forEach((zone) => {
        if (zone.pixelIndices) {
          zone.pixelIndices.forEach(index => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
          });
        }
      });
    }

    if (isDragging && currentSelection) {
      ctx.fillStyle = "rgba(20, 120, 200, 0.3)";
      currentSelection.pixelIndices.forEach(index => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      });

      ctx.strokeStyle = "#007bff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentSelection.x * pixelSize,
        currentSelection.y * pixelSize,
        currentSelection.width * pixelSize,
        currentSelection.height * pixelSize
      );
    }

    // 5. Draw products
    const renderedProductIds = new Set<string>();
    products?.forEach((product: any) => {
      if (!renderedProductIds.has(product._id) && renderedProducts.has(product._id)) {
        renderedProductIds.add(product._id);
        const img = imageCache.current[product.images[0]];

        if (img?.complete) {
          // Skip if no pixel information available
          if (!product.pixelIndices && (product.pixelIndex === undefined || product.pixelCount === undefined)) {
            return;
          }

          // Calculate the bounding box of all pixels for this product
          let minCol = cols, maxCol = 0;
          let minRow = rows, maxRow = 0;

          // Handle both pixelIndices array and pixelIndex+pixelCount formats
          const indices = product.pixelIndices ||
            Array.from({ length: product.pixelCount }, (_, i) => product.pixelIndex + i);

          indices.forEach((index: any) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            minCol = Math.min(minCol, col);
            maxCol = Math.max(maxCol, col);
            minRow = Math.min(minRow, row);
            maxRow = Math.max(maxRow, row);
          });

          const width = maxCol - minCol + 1;
          const height = maxRow - minRow + 1;

          // Draw the image across all pixels
          ctx.drawImage(
            img,
            minCol * pixelSize,
            minRow * pixelSize,
            width * pixelSize,
            height * pixelSize
          );

          // Draw red border if in auction zone
          const isInAuctionZone = indices.some((index: any) =>
            config?.auctionZones?.some(zone =>
              zone.pixelIndices?.includes(index)
            )
          );

          if (isInAuctionZone) {
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 1;
            ctx.strokeRect(
              minCol * pixelSize,
              minRow * pixelSize,
              width * pixelSize,
              height * pixelSize
            );
          }
        }
      }
    });
  }, [products, renderedProducts, config?.auctionZones, isAdmin, currentSelection, isDragging, isEmptyArea, isAreaOverlapping]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    setIsDragging(true);
    setDragStart({ x, y });
    setCurrentSelection({
      id: 'temp-' + Date.now(),
      x,
      y,
      width: 1,
      height: 1,
      products: [],
      isEmpty: true,
      pixelIndices: getPixelIndices(x, y, 1, 1) // Initialize with single pixel indices
    });
    setError(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setHoverPosition({ x: e.clientX, y: e.clientY });

    // Handle zone/product hover when not dragging
    if (!isDragging) {
      const x = Math.floor(mouseX / pixelSize);
      const y = Math.floor(mouseY / pixelSize);

      // Check for product hover
      const product = productMap.current[y * cols + x];
      if (product) {
        setHoveredProduct(product);
        setHoveredZone(null);
        return;
      }

      setHoveredProduct(null);

      // Check for zone hover
      const hovered = auctionZones.find(
        (zone) =>
          x >= zone.x &&
          x < zone.x + zone.width &&
          y >= zone.y &&
          y < zone.y + zone.height
      );
      setHoveredZone(hovered || null);
      return;
    }

    // Handle selection dragging
    if (isAdmin && isDragging && dragStart) {
      const x = Math.floor(mouseX / pixelSize);
      const y = Math.floor(mouseY / pixelSize);

      // Calculate selection dimensions based on drag direction
      const width = Math.max(1, Math.abs(x - dragStart.x) + 1);
      const height = Math.max(1, Math.abs(y - dragStart.y) + 1);
      const startX = Math.min(dragStart.x, x);
      const startY = Math.min(dragStart.y, y);

      const pixelIndices = getPixelIndices(startX, startY, width, height);
      const productsInArea = findProductsInArea(startX, startY, width, height);
      const isEmpty = isEmptyArea(startX, startY, width, height);

      setCurrentSelection({
        id: 'temp-' + Date.now(),
        x: startX,
        y: startY,
        width,
        height,
        products: productsInArea,
        isEmpty,
        pixelIndices
      });

      // Force redraw to show the selection
      drawCanvas();
    }
  };

  const handleMouseUp = () => {
    if (!isAdmin || !isDragging) {
      setIsDragging(false);
      return;
    }

    setIsDragging(false);

    if (currentSelection) {
      const { x, y, width, height } = currentSelection;

      if (isAreaOverlapping(x, y, width, height)) {
        setError("This area overlaps with an existing auction zone");
        setCurrentSelection(null);
        return;
      }

      const productsInArea = findProductsInArea(x, y, width, height);
      const isEmpty = isEmptyArea(x, y, width, height);

      if (!isEmpty && productsInArea.length === 0) {
        setError("This area contains products but could not identify them");
        setCurrentSelection(null);
        return;
      }
    }
  };

  const addCurrentSelectionToZones = () => {
    if (!currentSelection) {
      setError("No area selected to add");
      return;
    }

    const { x, y, width, height, isEmpty, products, pixelIndices } = currentSelection;

    if (isAreaOverlapping(x, y, width, height)) {
      setError("This area overlaps with an existing auction zone");
      return;
    }

    if (!isEmpty && products.length === 0) {
      setError("This area contains products but could not identify them");
      return;
    }

    const newZone: AuctionZone = {
      id: Date.now().toString(),
      x,
      y,
      width,
      height,
      products,
      isEmpty,
      pixelIndices
    };

    setAuctionZones((prev) => [...prev, newZone]);
    pixelIndices.forEach(index => {
      blockedPixels.current.add(index);
    });
    setCurrentSelection(null);
    setError(null);
    drawCanvas();
  };

  const saveAuctionZones = async () => {
    if (auctionZones.length === 0) {
      setError("No auction zones to save");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/auction-zones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveAll',
          zones: auctionZones.map(zone => ({
            x: zone.x,
            y: zone.y,
            width: zone.width,
            height: zone.height,
            productIds: zone.products.map(p => p._id),
            isEmpty: zone.isEmpty,
            pixelIndices: zone.pixelIndices,
            _id: zone._id
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to save auction zones');

      const data = await response.json();
      setAuctionZones(data.zones.map((zone: any) => ({
        id: zone._id,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        products: products.filter(p => zone.productIds.includes(p._id)),
        isEmpty: zone.isEmpty,
        pixelIndices: zone.pixelIndices,
        _id: zone._id,
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt
      })));

      const newBlockedPixels = new Set<number>();
      data.zones.forEach((zone: any) => {
        zone.pixelIndices.forEach((index: number) => {
          newBlockedPixels.add(index);
        });
      });
      blockedPixels.current = newBlockedPixels;

      setError(null);
      alert('Auction zones saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save auction zones');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isAdmin) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const x = Math.floor(mouseX / pixelSize);
    const y = Math.floor(mouseY / pixelSize);

    const product = productMap.current[y * cols + x];
    if (product) {
      router.push(`/product/${product._id}`);
      return;
    }

    if (hoveredZone) {
      router.push(`/auction/${hoveredZone.id}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newlyRendered = new Set<string>();
      products.forEach((product) => {
        const img = imageCache.current[product.images[0]];
        if (img?.complete && !renderedProducts.has(product._id)) {
          newlyRendered.add(product._id);
        }
      });
      if (newlyRendered.size > 0) {
        setRenderedProducts((prev) => new Set([...prev, ...newlyRendered]));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [products, renderedProducts]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="col-lg-12">
      <div className="card million-dollar-style">
        <div className="card-body">
          {isAdmin && (
            <div className="admin-controls mb-3">
              <div className="d-flex gap-2 mb-2">
                <button
                  className="btn btn-primary"
                  onClick={addCurrentSelectionToZones}
                  disabled={!currentSelection}
                >
                  Add Selected Zone
                </button>
                <button
                  className="btn btn-success"
                  onClick={saveAuctionZones}
                  disabled={auctionZones.length === 0 || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save All Zones'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setAuctionZones([]);
                    blockedPixels.current = new Set();
                    setCurrentSelection(null);
                    setError(null);
                    drawCanvas();
                  }}
                >
                  Clear All Zones
                </button>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
            </div>
          )}

          <div className="position-relative">
            <div ref={containerRef} style={{ overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ width: `${cols * pixelSize}px`, height: `${rows * pixelSize}px` }}>
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleClick}
                  style={{
                    cursor: isAdmin ? "crosshair" : (hoveredProduct || hoveredZone) ? "pointer" : "default",
                    backgroundColor: "#fff"
                  }}
                />
              </div>
            </div>

            {hoveredZone && (
              <div className="area-tooltip" style={{
                position: 'fixed',
                left: `${hoverPosition.x + 20}px`,
                top: `${hoverPosition.y + 20}px`,
                background: 'white',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                border: `2px solid ${hoveredZone.isEmpty ? '#ffd700' : '#4a90e2'}`
              }}>
                <h5>{hoveredZone.isEmpty ? 'Empty Auction Zone' : 'Product Auction Zone'}</h5>
                <p>Size: {hoveredZone.width}x{hoveredZone.height}</p>
                <p>Position: ({hoveredZone.x}, {hoveredZone.y})</p>
                {!hoveredZone.isEmpty && (
                  <div>
                    <p>Products:</p>
                    <ul>
                      {hoveredZone.products.map(product => (
                        <li key={product._id}>{product.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {hoveredProduct && (
              <div className="product-tooltip" style={{
                position: 'fixed',
                left: `${hoverPosition.x + 20}px`,
                top: `${hoverPosition.y + 20}px`,
                background: 'white',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                border: '2px solid #4a90e2'
              }}>
                <h5>{hoveredProduct.title}</h5>
                <img src={hoveredProduct.images[0]} alt={hoveredProduct.title}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


