import { useSales } from "@/context/SalesContext";

export function PrintRemitoButton({ remitoId }: { remitoId: string }) {
  const { markRemitoAsPrinted } = useSales();

  const handlePrint = async () => {
    window.print(); 
    await markRemitoAsPrinted(remitoId);
  };

  return (
    <button 
      onClick={handlePrint}
      className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2"
    >
      <span>🖨️</span> Imprimir y Marcar
    </button>
  );
}