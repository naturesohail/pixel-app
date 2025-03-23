export default function page(){

    return (
        <>
       <div className="subscribe">
  <div className="container">
    <div className="row">
      <div className="col-lg-8">
        <div className="section-heading">
          <h2>Subscribe To Get Notified About New Bids</h2>
          <span>
            Stay updated with the latest bidding opportunities posted by the admin.
          </span>
        </div>
        <form id="subscribe" action="" method="get">
          <div className="row">
            <div className="col-lg-5">
              <fieldset>
                <input
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Your Name"
                />
              </fieldset>
            </div>
            <div className="col-lg-5">
              <fieldset>
                <input
                  name="email"
                  type="text"
                  id="email"
                  pattern="[^ @]*@[^ @]*"
                  placeholder="Your Email Address"
                />
              </fieldset>
            </div>
            <div className="col-lg-2">
              <fieldset>
                <button
                  type="submit"
                  id="form-submit"
                  className="main-dark-button"
                >
                  <i className="fa fa-bell" />
                </button>
              </fieldset>
            </div>
          </div>
        </form>
      </div>
      <div className="col-lg-4">
        <div className="row">
          <div className="col-6">
            <ul>
            
              <li>
                Phone:
                <br />
                <span>010-020-0340</span>
              </li>
              <li>
                Office Location:
                <br />
                <span>North Miami Beach</span>
              </li>
            </ul>
          </div>
          <div className="col-6">
            <ul>
              
              <li>
                Email:
                <br />
                <span>info@company.com</span>
              </li>
              <li>
                Social Media:
                <br />
                <span>
                  <a href="#">Facebook</a>, <a href="#">Instagram</a>,
                  <a href="#">Behance</a>, <a href="#">Linkedin</a>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
        <footer>
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="first-item">
                            <div className="logo">
                                {/* <img
                                    src="/assets/images/white-logo.png"
                                    alt="hexashop ecommerce templatemo"
                                /> */}
                                <span style={{color:"white"}}> 
                                                                 MDC
                                </span>
                            </div>
                            <ul>
                                <li>
                                    <a href="#">
                                        16501 Collins Ave, Sunny Isles Beach, FL 33160, United States
                                    </a>
                                </li>
                                <li>
                                    <a href="#">hexashop@company.com</a>
                                </li>
                                <li>
                                    <a href="#">010-020-0340</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="col-lg-4">
                        <h4>Useful Links</h4>
                        <ul>
                            <li>
                                <a href="#">Homepage</a>
                            </li>
                            <li>
                                <a href="#">About Us</a>
                            </li>
                            <li>
                                <a href="#">Help</a>
                            </li>
                            <li>
                                <a href="#">Contact Us</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-lg-2">
                        <h4>Help &amp; Information</h4>
                        <ul>
                            <li>
                                <a href="#">Help</a>
                            </li>
                            <li>
                                <a href="#">FAQ's</a>
                            </li>
                           
                        </ul>
                    </div>
                    <div className="col-lg-12">
                        <div className="under-footer">
                            <p>
                            Copyright © {new Date().getFullYear()} MDC. All Rights Reserved.
                            <br />

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
        </footer>
        </>
    )
}