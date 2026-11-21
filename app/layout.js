import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/manrope/wght.css";
import Script from "next/script";

export const metadata = {
  title: "Great Bridges Initiative",
  description:
    "The Great Bridges Initiative connects students and recent graduates with leaders in AI, business, engineering, and digital media.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <a
            className="brand"
            href="/"
            aria-label="Great Bridges Initiative home"
          >
            <img
              className="lg-full"
              src="/assets/logos/gbi-logo-white.svg"
              alt="Great Bridges Initiative"
            />
            <img
              className="lg-mark"
              src="/assets/logos/gbi-mark.svg"
              alt=""
              aria-hidden="true"
            />
          </a>
          <button
            className="nav-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="primary-navigation"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
          <div className="nav-links" id="primary-navigation">
            <a href="/">Home</a>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact</a>
            <a href="/dashboard">My application</a>
            <a className="nb" href="/apply">
              Apply
            </a>
          </div>
        </nav>
        {children}
        <footer className="ft">
          <div className="ftg">
            <div>
              <a
                className="fl"
                href="/"
                aria-label="Great Bridges Initiative home"
              >
                <img
                  className="lg-foot"
                  src="/assets/logos/gbi-logo-white.svg"
                  alt="Great Bridges Initiative"
                />
              </a>
              <p>Connecting talent, experience and opportunity.</p>
            </div>
            <div>
              <h4>Programme</h4>
              <a href="/">Home</a>
              <a href="/faq">FAQ</a>
              <a href="/apply">Apply</a>
            </div>
            <div>
              <h4>Applicants</h4>
              <a href="/dashboard">My application</a>
              <a href="/contact">Contact</a>
              <a href="mailto:info@gbi.com">info@gbi.com</a>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="/privacy">Privacy policy</a>
              <a href="/terms">Terms and conditions</a>
            </div>
          </div>
          <div className="ftb">
            © 2026 Great Bridges Initiative. All rights reserved.{" "}
          </div>
        </footer>
        <Script src="/scripts/app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
