"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Swal from "sweetalert2";

interface Product {
  _id: string;
  title: string;
  images: string[];
  pixelIndex: number;
  pixelCount: number;
  purchaseType?: "one-time" | "bid";
  price?: number;
  zoneId: string;
}

interface Config {
  totalPixels: number;
  availablePixels: number;
  auctionZones?: AuctionZone[];
}

interface AuctionZone {
  _id?: string;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  products: Product[];
  isEmpty: boolean;
  status: "active" | "sold" | "expired";
  currentBid?: number;
  currentBidder?: string;
  buyNowPrice?: number;
  auctionEndDate?: string;
  totalPixels?: number;
  pixelPrice?: number;
}

export default function AuctionCard({ config, products }: any) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [hoveredZone, setHoveredZone] = useState<AuctionZone | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [renderedProducts, setRenderedProducts] = useState<Set<string>>(
    new Set()
  );
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const [auctionZones, setAuctionZones] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentSelection, setCurrentSelection] = useState<AuctionZone | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState<number>(3);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [pixelPrice, setPixelPrice] = useState<number>(0);
  const [buyNowPrice, setBuyNowPrice] = useState<number>(0);

  const isAdmin = user?.isAdmin;
  const pixelSize = 12;
  const cols = 100;
  const rows = 100;

  const productMap = useRef<Record<number, Product>>({});
  console.log("auctionZones :>> ", auctionZones);
  // Initialize auction zones from config
  useEffect(() => {
    if (config?.auctionZones) {
      const now = new Date();
      const zones = config.auctionZones
        .map((zone: any) => ({
          ...zone,
          id: zone._id || `zone-${Date.now()}`,
          products: products.find((p: any) => p.zoneId === zone._id),
          isEmpty: zone.isEmpty || false,
          status: zone.status || "active",
          auctionEndDate:
            zone.auctionEndDate ||
            new Date(
              Date.now() + (zone.auctionDuration || 3) * 24 * 60 * 60 * 1000
            ).toISOString(),
          totalPixels: zone.width * zone.height,
          pixelPrice: zone.pixelPrice || 0.01,
        }))
        .filter((zone: any) => {
          if (zone.auctionEndDate && new Date(zone.auctionEndDate) < now) {
            return false;
          }
          return true;
        });
      console.log("zones :>> ", zones);
      setAuctionZones(zones);
      drawCanvas();
    }
  }, [config, products]);
  // useEffect(() => {
  //   if (!showAuctionModal) return;
  //   console.log("buyNowPrice :>> ", buyNowPrice);
  //   if (buyNowPrice <= 0 || pixelPrice <= 0) return;
  //   confirmAuctionZone();
  // }, [showAuctionModal, buyNowPrice, pixelPrice]);
  // Check for expired auctions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updatedZones = auctionZones
        .map((zone: any) => {
          if (
            zone.status === "active" &&
            zone.auctionEndDate &&
            new Date(zone.auctionEndDate) < now
          ) {
            return { ...zone, status: "expired" };
          }
          return zone;
        })
        .filter((zone) => {
          // Remove zones that have been expired for more than 1 hour
          if (zone.status === "expired" && zone.auctionEndDate) {
            const expiredTime = new Date(zone.auctionEndDate).getTime();
            return now.getTime() - expiredTime < 3600000; // 1 hour grace period
          }
          return true;
        });

      if (updatedZones.length !== auctionZones.length) {
        setAuctionZones(updatedZones);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [auctionZones]);

  // const preloadImages = useCallback(() => {
  //   products.forEach((product) => {
  //     if (!imageCache.current[product.images[0]]) {
  //       const img = new Image();
  //       img.src = product.images[0];
  //       imageCache.current[product.images[0]] = img;
  //     }
  //   });
  // }, [products]);

  const isAreaOverlapping = (zones: AuctionZone[]) => {
    for (let i = 0; i < zones.length; i++) {
      const a = zones[i];

      for (let j = i + 1; j < zones.length; j++) {
        const b = zones[j];

        const isOverlapping =
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;

        if (isOverlapping) {
          return true;
        }
      }
    }

    return false;
  };

  const findProductsInArea = useCallback(
    (x: number, y: number, width: number, height: number): Product[] => {
      const productSet = new Set<Product>();

      products?.forEach((product: any) => {
        if (
          product.pixelIndex !== undefined &&
          product.pixelCount !== undefined
        ) {
          const productX = product.pixelIndex % cols;
          const productY = Math.floor(product.pixelIndex / cols);
          const productWidth = product.pixelCount;
          const productHeight = 1;

          if (
            productX + productWidth > x &&
            productX < x + width &&
            productY + productHeight > y &&
            productY < y + height
          ) {
            productSet.add(product);
          }
        }
      });

      return Array.from(productSet);
    },
    [products]
  );

  const isEmptyArea = useCallback(
    (x: number, y: number, width: number, height: number): boolean => {
      const overlappingProducts = findProductsInArea(x, y, width, height);
      return overlappingProducts.length === 0;
    },
    [findProductsInArea]
  );

  useEffect(() => {
    auctionZones.forEach((zone) => {
      if (zone?.products?.images) {
        const img = zone?.products?.images[0] || null; // Use a placeholder if no image is available
        if (!imageCache.current[zone._id]) {
          laodImage(img, zone._id);
        }
      }
    });
  }, [auctionZones]);
  const laodImage = (img: string, aId: string) => {
    const dummyImg = new Image();
    dummyImg.src = img;
    imageCache.current[aId] = dummyImg;
  };
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
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

    // Draw auction zones

    auctionZones.forEach((zone) => {
      const zoneX = zone.x * pixelSize;
      const zoneY = zone.y * pixelSize;
      const zoneWidth = zone.width * pixelSize;
      const zoneHeight = zone.height * pixelSize;

      // Fill background color (under the image, for transparency fallback)
      let fillColor;
      if (zone.status === "sold") {
        fillColor = "rgba(0, 200, 0, 0.2)";
      } else if (zone.status === "expired") {
        fillColor = "rgba(255, 0, 0, 0.2)";
      } else if (zone?.bids?.length) {
        fillColor = "rgba(255, 111, 0, 0.52)";
      } else {
        fillColor = "rgba(20, 81, 171, 0.2)";
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);

      // Draw image (if loaded)
      const img = imageCache.current[zone._id];
      if (img) {
        if (img?.complete) {
          ctx.drawImage(img, zoneX, zoneY, zoneWidth, zoneHeight);
        } else if (img) {
          img.onload = () => {
            ctx.drawImage(img, zoneX, zoneY, zoneWidth, zoneHeight);
          };
        }
      }
      console.log(" zone.bids.length :>> ", zone.status);
      // Stroke border
      ctx.strokeStyle =
        zone.status === "sold"
          ? "#00c800"
          : zone?.status === "expired"
          ? "#c80000"
          : zone?.bids?.length
          ? "rgb(255, 111, 0)"
          : "#0064ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);

      // Draw info text (on top)
      if (zone.width > 5 && zone.height > 5) {
        ctx.fillStyle =
          zone.status === "sold"
            ? "#004d00"
            : zone.status === "expired"
            ? "#800000"
            : zone?.bids?.length
            ? "rgb(255, 111, 0)"
            : "#003366";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
          `${zone.width}x${zone.height} (${zone.totalPixels}px)`,
          zoneX + zoneWidth / 2,
          zoneY + zoneHeight / 2
        );

        if (zone.auctionEndDate) {
          const endDate = new Date(zone.auctionEndDate);
          const daysLeft = Math.ceil(
            (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          ctx.fillText(
            `Ends in ${daysLeft}d`,
            zoneX + zoneWidth / 2,
            zoneY + zoneHeight / 2 + 15
          );
        }
      }
    });

    if (isAdmin && currentSelection) {
      ctx.fillStyle = "rgba(0, 100, 255, 0.3)";
      ctx.fillRect(
        currentSelection.x * pixelSize,
        currentSelection.y * pixelSize,
        currentSelection.width * pixelSize,
        currentSelection.height * pixelSize
      );

      ctx.strokeStyle = "#0064ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentSelection.x * pixelSize,
        currentSelection.y * pixelSize,
        currentSelection.width * pixelSize,
        currentSelection.height * pixelSize
      );
    }

    // Draw products
    const renderedProductIds = new Set<string>();

    products?.forEach((product: any) => {
      if (
        !renderedProductIds.has(product._id) &&
        renderedProducts.has(product._id)
      ) {
        renderedProductIds.add(product._id);
        // const img = imageCache.current[product.images[0]];
        const img = imageCache.current["auctionZoneImage"];

        if (
          img?.complete &&
          product.pixelIndex !== undefined &&
          product.pixelCount !== undefined
        ) {
          const x = product.pixelIndex % cols;
          const y = Math.floor(product.pixelIndex / cols);
          const width = product.pixelCount;
          const height = 1;

          ctx.drawImage(
            img,
            x * pixelSize,
            y * pixelSize,
            width * pixelSize,
            height * pixelSize
          );

          const isInAuctionZone = auctionZones.some(
            (zone) =>
              x >= zone.x &&
              x + width <= zone.x + zone.width &&
              y >= zone.y &&
              y + height <= zone.y + zone.height
          );

          if (isInAuctionZone) {
            ctx.strokeStyle =
              product.purchaseType === "bid" ? "#ff9900" : "#00cc00";
            ctx.lineWidth = 1;
            ctx.strokeRect(
              x * pixelSize,
              y * pixelSize,
              width * pixelSize,
              height * pixelSize
            );
          }
        }
      }
    });
  }, [products, renderedProducts, auctionZones, isAdmin, currentSelection]);

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
      id: "temp-" + Date.now(),
      x,
      y,
      width: 1,
      height: 1,
      products: [],
      isEmpty: true,
      status: "active",
      totalPixels: 1,
      pixelPrice: pixelPrice,
      buyNowPrice: buyNowPrice,
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

    if (isAdmin && isDragging && dragStart) {
      const x = Math.floor(mouseX / pixelSize);
      const y = Math.floor(mouseY / pixelSize);
      const width = Math.max(1, Math.abs(x - dragStart.x) + 1);
      const height = Math.max(1, Math.abs(y - dragStart.y) + 1);
      const startX = Math.min(dragStart.x, x);
      const startY = Math.min(dragStart.y, y);

      const productsInArea = findProductsInArea(startX, startY, width, height);
      const isEmpty = isEmptyArea(startX, startY, width, height);
      const totalPixels = width * height;

      setCurrentSelection({
        id: "temp-" + Date.now(),
        x: startX,
        y: startY,
        width,
        height,
        products: productsInArea,
        isEmpty,
        status: "active",
        totalPixels,
        pixelPrice: pixelPrice,
      });
      return;
    }

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
  };

  const handleMouseUp = () => {
    if (!isAdmin || !isDragging || !currentSelection) {
      setIsDragging(false);
      return;
    }

    const { x, y, width, height } = currentSelection;

    if (isAreaOverlapping(auctionZones)) {
      setError("This area overlaps with an existing auction zone");
      setIsDragging(false);
      setCurrentSelection(null);
      return;
    }

    const productsInArea = findProductsInArea(x, y, width, height);
    const isEmpty = isEmptyArea(x, y, width, height);

    if (!isEmpty && productsInArea.length === 0) {
      setError("This area contains products but could not identify them");
      setIsDragging(false);
      setCurrentSelection(null);
      return;
    }

    setIsDragging(false);
    setShowAuctionModal(true);
  };
  console.log("error :>> ", error);
  const confirmAuctionZone = () => {
    console.log("buyNowPrice 88:>> ", currentSelection, buyNowPrice);
    if (!currentSelection) {
      setError("No area selected to add");
      return;
    }

    const { x, y, width, height, isEmpty, products } = currentSelection;

    if (isAreaOverlapping(auctionZones)) {
      setError("This area overlaps with an existing auction zone");
      return;
    }

    if (!isEmpty && products.length === 0) {
      setError("This area contains products but could not identify them");
      return;
    }

    const auctionEndDate = new Date(
      Date.now() + auctionDuration * 24 * 60 * 60 * 1000
    ).toISOString();
    const totalPixels = width * height;
    const basePrice = totalPixels * pixelPrice;

    const newZone: AuctionZone = {
      id: Date.now().toString(),
      x,
      y,
      width,
      height,
      products,
      isEmpty,
      status: "active",
      auctionEndDate,
      totalPixels,
      pixelPrice,
      buyNowPrice,
    };
    const updatedZones = [...auctionZones, newZone];
    setAuctionZones(updatedZones);
    // setCurrentSelection(null);
    setError(null);
    // setShowAuctionModal(false);
    drawCanvas();
    return updatedZones;
  };
  const saveAuctionZones = async () => {
    const auctionZones = confirmAuctionZone();
    if (!auctionZones) return;
    if (auctionZones.length === 0) {
      setError("No auction zones to save");
      return;
    }

    setIsSaving(true);
    try {
      // console.log('object :>> ', object);
      const response = await fetch("/api/auction-zones", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "saveAll",
          zones: auctionZones.map((zone) => {
            // console.log('zone :>> ', zone);
            return {
              x: zone.x,
              y: zone.y,
              width: zone.width,
              height: zone.height,
              productIds: [],
              isEmpty: zone.isEmpty,
              status: zone.status,
              auctionEndDate: zone.auctionEndDate,
              buyNowPrice: zone.buyNowPrice,
              totalPixels: zone.totalPixels, // Include totalPixels
              pixelPrice: zone.pixelPrice,
            };
          }),
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Cannot add new zones while another zone is active");
        }
        throw new Error("Failed to save auction zones");
      }

      const data = await response.json();
      setAuctionZones(
        data.zones.map((zone: any) => ({
          ...zone,
          id: zone._id,
          products: products.find((p: any) => zone.productIds.includes(p._id)),
        }))
      );

      setError(null);
      alert("Auction zones saved successfully!");
      setShowAuctionModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to save auction zones");
    } finally {
      setIsSaving(false);
    }
  };
  const handleClick = (e: React.MouseEvent) => {
    if (user?.isAdmin) return;

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
      if (hoveredZone.status === "sold") {
        return;
      }
      router.push(`/auctions/${hoveredZone.id}`);
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newlyRendered = new Set<string>();
  //     products.forEach((product) => {
  //       const img = imageCache.current[product.images[0]];
  //       if (img?.complete && !renderedProducts.has(product._id)) {
  //         newlyRendered.add(product._id);
  //       }
  //     });
  //     if (newlyRendered.size > 0) {
  //       setRenderedProducts((prev) => new Set([...prev, ...newlyRendered]));
  //     }
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, [products, renderedProducts]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="col-lg-12">
      <div className="card million-dollar-style">
        <div className="card-body">
          {/* {isAdmin && (
            <div className="admin-controls mb-3">
              <div className="d-flex gap-2 mb-2">
                <button
                  className="btn btn-success"
                  onClick={saveAuctionZones}
                  disabled={auctionZones.length === 0 || isSaving}
                >
                  {isSaving ? "Saving..." : "Save All Zones"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setAuctionZones([]);
                    setCurrentSelection(null);
                    setError(null);
                    drawCanvas();
                  }}
                >
                  Clear All Zones
                </button>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="alert alert-info">
                <p>
                  Admin Instructions: Click and drag to create auction zones.
                  Zones must not overlap.
                </p>
              </div>
            </div>
          )} */}

          <div className="position-relative">
            <div
              ref={containerRef}
              style={{ overflowY: "auto", maxHeight: "70vh" }}
            >
              <div
                style={{
                  width: `${cols * pixelSize}px`,
                  height: `${rows * pixelSize}px`,
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleClick}
                  style={{
                    cursor: isAdmin
                      ? "crosshair"
                      : hoveredProduct || hoveredZone
                      ? "pointer"
                      : "default",
                    backgroundColor: "#fff",
                  }}
                />
              </div>
            </div>

            {hoveredZone && (
              <div
                className="area-tooltip"
                style={{
                  position: "fixed",
                  left: `${hoverPosition.x + 20}px`,
                  top: `${hoverPosition.y + 20}px`,
                  background: "white",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  border: `2px solid ${
                    hoveredZone.status === "sold"
                      ? "#00c800"
                      : hoveredZone.status === "expired"
                      ? "#c80000"
                      : "#0064ff"
                  }`,
                  zIndex: 1000,
                }}
              >
                <h5>
                  {hoveredZone.isEmpty
                    ? "Empty Auction Zone"
                    : "Product Auction Zone"}
                </h5>
                <p>
                  Size: {hoveredZone.width}x{hoveredZone.height} pixels
                </p>
                <p>Total Pixels: {hoveredZone.totalPixels}</p>
                <p>
                  Position: ({hoveredZone.x}, {hoveredZone.y})
                </p>
                <p>Status: {hoveredZone.status.toUpperCase()}</p>
                {hoveredZone.auctionEndDate && (
                  <p>
                    Ends:{" "}
                    {new Date(hoveredZone.auctionEndDate).toLocaleString()}
                  </p>
                )}
                {hoveredZone.buyNowPrice && (
                  <p>
                    Buy Now Price: $
                    {hoveredZone.buyNowPrice <= 1
                      ? ""
                      : hoveredZone.buyNowPrice.toFixed(2)}
                  </p>
                )}
                {hoveredZone.pixelPrice && (
                  <p>Pixel Price: ${hoveredZone.pixelPrice.toFixed(2)}</p>
                )}
                {!hoveredZone.isEmpty && (
                  <div>
                    <p>Products:</p>
                    <ul>
                      {hoveredZone.products.map((product) => (
                        <li key={product._id}>{product.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {hoveredProduct && (
              <div
                className="product-tooltip"
                style={{
                  position: "fixed",
                  left: `${hoverPosition.x + 20}px`,
                  top: `${hoverPosition.y + 20}px`,
                  background: "white",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  border: "2px solid #4a90e2",
                  zIndex: 1000,
                }}
              >
                <h5>{hoveredProduct.title}</h5>
                <img
                  src={hoveredProduct.images[0]}
                  alt={hoveredProduct.title}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
                {hoveredProduct.purchaseType && (
                  <p>
                    Purchase Type:{" "}
                    {hoveredProduct.purchaseType === "bid"
                      ? "Bidding"
                      : "One-time Purchase"}
                  </p>
                )}
                {hoveredProduct.price && (
                  <p>Price: ${hoveredProduct.price.toFixed(2)}</p>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => router.push(`/product/${hoveredProduct._id}`)}
                >
                  View Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auction Zone Creation Modal */}
      {showAuctionModal && currentSelection && (
        <div
          className="modal show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Auction Zone</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {}}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Auction Duration (Days)</label>
                  <select
                    className="form-select"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(Number(e.target.value))}
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                    <option value="6">6 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Pixel Price ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    value={pixelPrice <= 0 ? "" : pixelPrice}
                    onChange={(e) => setPixelPrice(parseFloat(e.target.value))}
                  />
                </div>{" "}
                <div className="mb-3">
                  <label className="form-label">Direct Buy Price ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    value={buyNowPrice <= 0 ? "" : buyNowPrice}
                    onChange={(e) => setBuyNowPrice(parseFloat(e.target.value))}
                  />
                </div>
                <div className="alert alert-info">
                  <p>
                    <strong>Zone Details:</strong>
                  </p>
                  <p>
                    Size: {currentSelection.width}x{currentSelection.height}{" "}
                    pixels
                  </p>
                  <p>
                    Total Pixels:{" "}
                    {currentSelection.width * currentSelection.height}
                  </p>
                  <p>
                    Position: ({currentSelection.x}, {currentSelection.y})
                  </p>
                  <p>
                    Base Price: $
                    {(
                      currentSelection.width *
                      currentSelection.height *
                      pixelPrice
                    ).toFixed(2)}
                  </p>
                  {!currentSelection.isEmpty && (
                    <div>
                      <p>
                        Contains {currentSelection.products.length} product(s):
                      </p>
                      <ul>
                        {currentSelection.products.map((product) => (
                          <li key={product._id}>
                            {product.title} - $
                            {product.price?.toFixed(2) || "0.00"}
                          </li>
                        ))}
                      </ul>
                      <p>
                        Total Products Value: $
                        {currentSelection.products
                          .reduce((sum, p) => sum + (p.price || 0), 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  )}
                  <p className="mt-2">
                    <strong>Estimated Buy Now Price:</strong> $
                    {(
                      currentSelection.width *
                        currentSelection.height *
                        pixelPrice +
                      currentSelection.products.reduce(
                        (sum, p) => sum + (p.price || 0),
                        0
                      )
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setAuctionZones([]);
                    setCurrentSelection(null);
                    setError(null);
                    drawCanvas();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    saveAuctionZones();
                  }}
                >
                  Create Auction Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
