import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function Page() {
    return (

        <>

            <Header />
           

            <section className="section mt-5" id="products">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-heading">
                                <h2>Our Latest Products</h2>
                                <span>Check out all of our products.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="item">
                                <div className="thumb">
                                    <div className="hover-content">
                                        <ul>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-eye" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-star" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-shopping-cart" />
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <img src="assets/images/men-01.jpg" alt="" />
                                </div>
                                <div className="down-content">
                                    <h4>Classic Spring</h4>
                                    <span>$120.00</span>
                                    <ul className="stars">
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="item">
                                <div className="thumb">
                                    <div className="hover-content">
                                        <ul>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-eye" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-star" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-shopping-cart" />
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <img src="assets/images/men-02.jpg" alt="" />
                                </div>
                                <div className="down-content">
                                    <h4>Air Force 1 X</h4>
                                    <span>$90.00</span>
                                    <ul className="stars">
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="item">
                                <div className="thumb">
                                    <div className="hover-content">
                                        <ul>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-eye" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-star" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="single-product.html">
                                                    <i className="fa fa-shopping-cart" />
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <img src="assets/images/men-03.jpg" alt="" />
                                </div>
                                <div className="down-content">
                                    <h4>Love Nana ‘20</h4>
                                    <span>$150.00</span>
                                    <ul className="stars">
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                        <li>
                                            <i className="fa fa-star" />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                       
                        <div className="col-lg-12">
                            <div className="pagination">
                                <ul>
                                    <li>
                                        <a href="#">1</a>
                                    </li>
                                    <li className="active">
                                        <a href="#">2</a>
                                    </li>
                                    <li>
                                        <a href="#">3</a>
                                    </li>
                                    <li>
                                        <a href="#">4</a>
                                    </li>
                                    <li>
                                        <a href="#">&gt;</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />

        </>

    )
}