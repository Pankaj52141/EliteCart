export default function AdminToolCard({ title, href, bgColor }) {
  return (
    <a
      href={href}
      className={`rounded-xl p-6 text-center shadow-xl ${bgColor} hover:brightness-110 transition`}
    >
      <h4 className="text-xl font-bold">{title}</h4>
    </a>
  );
}
