import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  useDocumentTitle("Not Found");
  return (
    <main className="zipree-404">
      <div className="zipree-404__inner">
        <p className="zipree-404__eyebrow">Off the Map</p>
        <h1 className="zipree-404__code">404</h1>
        <div className="zipree-404__rule" aria-hidden="true" />
        <p className="zipree-404__title">The road less travelled ends here.</p>
        <p className="zipree-404__lede">
          This page is not part of the ZIPREE experience. Return to the studio and explore the fleet.
        </p>
        <Link to="/" className="zipree-404__cta">
          Return to the Studio
        </Link>
      </div>
    </main>
  );
}