import "./Logo.css";

export default function Logo({ className = "" }) {
  return (
    <div className={`zipree-logo ${className}`}>
      <img 
        src="/zipree-logo.png" 
        alt="ZIPREE" 
        className="zipree-logo__img" 
      />
    </div>
  );
}