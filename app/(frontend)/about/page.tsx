import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer"

export default function Page() {


    return (
        <>
            <Header />
            <div className="page-heading about-page-heading" id="top"></div>
            <div className="about-us mt-4">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="left-image">
                                <img src="assets/images/about-left-image.jpg" alt="" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="right-content">
                                <h4>About Us &amp; Our Skills</h4>
                                <span>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                    eiusmod kon tempor incididunt ut labore.
                                </span>
                                <div className="quote">
                                    <i className="fa fa-quote-left" />
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                        eiuski smod kon tempor incididunt ut labore.
                                    </p>
                                </div>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                    eiusmod kon tempor incididunt ut labore et dolore magna aliqua ut
                                    enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                    nisi ut aliquip.
                                </p>
                                <ul>
                                    <li>
                                        <a href="#">
                                            <i className="fa fa-facebook" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i className="fa fa-twitter" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i className="fa fa-linkedin" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i className="fa fa-behance" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           
            <Footer />
        </>

    )
}