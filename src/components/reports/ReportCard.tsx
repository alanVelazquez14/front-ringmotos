type Props = {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
};

export default function ReportCard({ title, value, unit, color = "text-gray-900" }: Props) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
      <h2 className={`text-3xl font-black mt-2 ${color}`}>
        {unit}{Number(value).toLocaleString("es-AR")}
      </h2>
    </div>
  );
}