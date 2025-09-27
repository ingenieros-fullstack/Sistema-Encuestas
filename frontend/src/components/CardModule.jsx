// src/components/CardModule.jsx
import { Link } from "react-router-dom";
import "../AdminPrincipal.css";

export default function CardModule({ icon, title, link, type, description }) {
  return (
    <Link to={link} className={`card-module ${type}`}>
      <div className="card-icon-wrapper">
        <div className="card-icon">{icon}</div>
      </div>
      <h5 className="card-title">{title}</h5>
      {description && <p className="card-description">{description}</p>}
    </Link>
  );
}
