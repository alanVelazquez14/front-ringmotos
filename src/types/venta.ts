export interface VentaItem {
  id?: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Venta {
  cliente?: string;
  items: VentaItem[];
  total: number;
  pago: number;
}
