import Link from "next/link";


export default function Page() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "60vh",
        }}>
            <main style={{ flex: 1 }}>
            </main>

            <footer style={{
                backgroundColor: "#333",
                color: "white",
                padding: "40px 0"
            }}>
                <div className="container">
                    <div className="row">

                        <div className="col-lg-6">
                            <div className="first-item">
                                <div className="logo">
                                    <span style={{ color: "white" }}>MDC</span>
                                </div>
                                <ul>

                                    <li>
                                        <a href="#">16501 Collins Ave, Sunny Isles Beach, FL 33160, United States</a>
                                    </li>
                                    <li>
                                        <a href="#">hexashop@company.com</a>
                                    </li>
                                    <li>
                                        <a href="#">010-020-0340</a>
                                    </li>
                                    <li>
                                        Last updated: {new Date().toLocaleDateString()}

                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <h4>Useful Links</h4>
                            <ul>
                                <li><Link href="/" className="active">Home</Link></li>
                                <li><Link href="/products">Auctions</Link></li>
                                <li><Link href="/contact">Contact Us</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-2">
                            <h4>Help &amp; Information</h4>
                            <ul>
                                <li><a href="#">Help</a></li>
                                <li><a href="#">FAQ's</a></li>
                            </ul>
                        </div>

                        <div className="col-lg-12">
                            <div className="under-footer">
                                <p>
                                    Copyright © {new Date().getFullYear()} MDC. All Rights Reserved.
                                </p>
                                <ul>
                                    <li><a href="#"><i className="fa fa-facebook" /></a></li>
                                    <li><a href="#"><i className="fa fa-twitter" /></a></li>
                                    <li><a href="#"><i className="fa fa-linkedin" /></a></li>
                                    <li><a href="#"><i className="fa fa-behance" /></a></li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
}
