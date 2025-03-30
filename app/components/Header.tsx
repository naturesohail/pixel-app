import Link from "next/link"
export default function Page() {
    return (
    <>
        <header className="header-area header-sticky">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="main-nav">
                            <Link href="/" className="logo">
                            <span style={{color:"black"}}> 
                                      MDC
                                </span>
                            </Link>
                            <ul className="nav">
                                
                                <li>
                                    <Link href="/products">Auctions</Link>
                                </li>
                                
                                <li>
                                    <Link href="/contact">Contact Us</Link>
                                </li>

                                
                            </ul>
                            <a className="menu-trigger">
                                <span>Menu</span>
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    </>
    )
}