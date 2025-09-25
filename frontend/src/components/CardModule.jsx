import { Link } from "react-router-dom";

export default function CardModule({ icon, title, link }) {
  return (
    <Link to={link} className="dashboard-card">
      <div>{icon}</div>
      <h5>{title}</h5>
    </Link>
  );
}
