import { Link } from "react-router-dom";

export default function CardModule({ icon, title, link }) {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
    </Link>
  );
}
