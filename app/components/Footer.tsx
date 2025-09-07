import Link from "next/link";

export default function Page() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const year = today.getFullYear();

    const formattedDate = `07-09-2025`;

    return (
        <div>
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
                                    <span style={{ color: "white" }}>AIOFTHEWORLD</span>
                                </div>

                                <ul>

                                    <li>
                                        <a href="#">Developed by Data App LLC admin@aioftheworld.com</a>
                                    </li>

                                    <li>
                                       <a href="#">Last Updated: {formattedDate}</a>
                                    </li>

                                </ul>
                                
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <h4>Useful Links</h4>
                            <ul>
                                <li><Link href="/" className="active">Home</Link></li>
                                {/* <li><Link href="/products">Auctions</Link></li> */}
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
                                    Copyright ©  MDC. All Rights Reserved.
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
