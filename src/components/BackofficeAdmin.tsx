import React, { useState } from "react";
import { Sliders, TrendingUp, Users, DollarSign, AlertTriangle, Play, Pause, Save, Check, RefreshCw, Eye, Percent, Ban } from "lucide-react";
import { Destino, Ticket, TransaccionInfo } from "../types";

interface BackofficeAdminProps {
  destinos: Destino[];
  tickets: Ticket[];
  transactions: TransaccionInfo[];
  onToggleEmergency: () => void;
  emergenciaActiva: boolean;
  onUpdateDestinoConfig: (id: string, updatedConfig: Partial<Destino>) => void;
  onClearTransactions: () => void;
}

export default function BackofficeAdmin({ destinos, tickets, transactions, onToggleEmergency, emergenciaActiva, onUpdateDestinoConfig, onClearTransactions }: BackofficeAdminProps) {
  // Config state
  const [editingDestinoId, setEditingDestinoId] = useState<string | null>(null);
  const [editMaxCapacity, setEditMaxCapacity] = useState(0);
  const [editPrecioBase, setEditPrecioBase] = useState(0);
  const [editPrecioExtranjero, setEditPrecioExtranjero] = useState(0);

  // Financial calculations
  const calculateTotalSales = () => {
    return transactions.reduce((sum, rx) => rx.estado === 'Éxito' ? sum + rx.monto : sum, 0);
  };

  const calculateTotalGuests = () => {
    return transactions.reduce((sum, rx) => rx.estado === 'Éxito' ? sum + rx.visitantes : sum, 0);
  };

  const handleEditStart = (dest: Destino) => {
    setEditingDestinoId(dest.id);
    setEditMaxCapacity(dest.maxCapacidad);
    setEditPrecioBase(dest.precioBase);
    setEditPrecioExtranjero(dest.precioExtranjero);
  };

  const handleEditSave = () => {
    if (!editingDestinoId) return;
    onUpdateDestinoConfig(editingDestinoId, {
      maxCapacidad: editMaxCapacity,
      precioBase: editPrecioBase,
      precioExtranjero: editPrecioExtranjero
    });
    setEditingDestinoId(null);
  };

  return (
    <div className="w-full bg-slate-50 font-sans space-y-8 animate-fade-in pr-0 md:pr-4" id="backoffice-admin-root">
      
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded inline-block font-bold mb-1.5">Módulo Administrativo</span>
          <h2 className="font-extrabold text-2xl tracking-tight text-slate-900 font-sans">Dashboard & Control de Capacidad General</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Analíticas en vivo, calibración de aforos de ingreso y tarifas nacionales</p>
        </div>

        {/* Emergency Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-emergency"
            onClick={onToggleEmergency}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 ${
              emergenciaActiva 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' 
                : 'bg-red-600 hover:bg-red-750 text-white shadow-red-900/10'
            }`}
          >
            {emergenciaActiva ? (
              <>
                <Play className="w-4 h-4" /> Desactivar Cierre de Emergencia
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" /> Cierre Temporal de Emergencia
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 4 Core KPICards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue progress */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Recaudación Total</span>
            <span className="text-lg font-extrabold text-slate-900 block font-mono">S/ {calculateTotalSales().toFixed(2)}</span>
            <p className="text-[10.5px] text-green-600 font-semibold font-mono">100% de transacciones seguras</p>
          </div>
        </div>

        {/* Card 2: Visitor Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Visitantes Registrados</span>
            <span className="text-lg font-extrabold text-slate-900 block font-mono">{calculateTotalGuests()} <span className="text-xs text-slate-400 font-normal">pax</span></span>
            <p className="text-[10.5px] text-red-600 font-semibold font-mono">Sincronizado vía Gateway</p>
          </div>
        </div>

        {/* Card 3: Alert limits */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Aforos Críticos</span>
            <span className="text-lg font-extrabold text-slate-900 block font-mono">
              {emergenciaActiva ? "CIERRE TOTAL" : destinos.filter(d => (d.capacidadActual / d.maxCapacidad) > 0.85).length} <span className="text-xs text-slate-400 font-normal">destinos</span>
            </span>
            <p className="text-[10.5px] text-amber-600 font-semibold font-mono">Machu Picchu superpoblación</p>
          </div>
        </div>

        {/* Card 4: System health status ISO */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Seguridad ISO 27001</span>
            <span className="text-base font-extrabold text-slate-900 block font-mono">Estrictamente Activo</span>
            <p className="text-[10.5px] text-emerald-600 font-semibold font-mono">WAF / Antifraude habilitado</p>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Aforo configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dynamic configuration panel table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">Configuración de Aforos y Tarifas por Sitio</h3>
              <p className="text-xs text-slate-500">Calibra la capacidad máxima permitida por día y ajusta los precios oficiales.</p>
            </div>
            {editingDestinoId && (
              <button
                id="btn-cancel-config-edit"
                onClick={() => setEditingDestinoId(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table id="table-destinos-config" className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-slate-400 font-bold uppercase font-mono bg-slate-50/50">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Destino</th>
                  <th className="py-2.5 px-3 text-center">Capacidad Máxima</th>
                  <th className="py-2.5 px-3 text-center">T. Nacional</th>
                  <th className="py-2.5 px-3 text-center">T. Extranjero</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {destinos.map((dest) => {
                  const isEditing = editingDestinoId === dest.id;
                  return (
                    <tr key={dest.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-650">{dest.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{dest.nombre}</span>
                        <span className="text-[10px] text-slate-405 block">{dest.ubicacion}, {dest.departamento}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editMaxCapacity}
                            onChange={(e) => setEditMaxCapacity(parseInt(e.target.value) || 1)}
                            className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-20 text-center text-xs font-mono font-bold focus:ring-1 focus:ring-red-500 text-slate-900"
                          />
                        ) : (
                          <span>{dest.maxCapacidad} pax</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrecioBase}
                            onChange={(e) => setEditPrecioBase(parseInt(e.target.value) || 0)}
                            className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-16 text-center text-xs font-mono focus:ring-1 focus:ring-red-500 text-slate-900"
                          />
                        ) : (
                          <span>S/ {dest.precioBase}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrecioExtranjero}
                            onChange={(e) => setEditPrecioExtranjero(parseInt(e.target.value) || 0)}
                            className="bg-slate-50 border border-gray-200 rounded px-2 py-1 w-16 text-center text-xs font-mono focus:ring-1 focus:ring-red-500 text-slate-900"
                          />
                        ) : (
                          <span>S/ {dest.precioExtranjero}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isEditing ? (
                          <button
                            id={`btn-save-config-${dest.id}`}
                            onClick={handleEditSave}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold p-1 px-2 text-[10.5px] rounded transition-all flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Save className="w-3 h-3" /> Guardar
                          </button>
                        ) : (
                          <button
                            id={`btn-edit-config-${dest.id}`}
                            onClick={() => handleEditStart(dest)}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold p-1 px-2.5 border border-gray-250 rounded transition-all cursor-pointer inline-block"
                          >
                            Ajustar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Historic Tendencia chart & transactions list */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Historial de Ocupación Semanal</h3>
            <p className="text-xs text-slate-500">Curvas de afluencia consolidada en puntos de acceso</p>
          </div>

          {/* Elegant inline SVG static line chart */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div className="h-32 w-full pt-1">
              <svg className="w-full h-full font-mono" viewBox="0 0 100 40">
                {/* Horizontal grid lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                
                {/* Simulated line curve connecting values for Machupicchu 40%, 65%, 85%, 60%, 75%, 90%, 80% */}
                <path 
                  d="M 5 35 Q 20 20, 35 15 T 65 24 T 80 10 T 95 18" 
                  fill="none" 
                  stroke="#dc2626" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                />
                <circle cx="5" cy="35" r="1.5" fill="#dc2626" />
                <circle cx="35" cy="15" r="1.5" fill="#dc2626" />
                <circle cx="65" cy="24" r="1.5" fill="#dc2626" />
                <circle cx="80" cy="10" r="1.5" fill="#dc2626" />
                <circle cx="95" cy="18" r="1.5" fill="#dc2626" />

                {/* Week day labels */}
                <text x="5" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Lu</text>
                <text x="23" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Ma</text>
                <text x="41" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Mi</text>
                <text x="59" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Ju</text>
                <text x="77" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Vi</text>
                <text x="95" y="39" fontSize="3" textAnchor="middle" fill="#94a3b8">Sa</text>
              </svg>
            </div>
            
            <div className="text-[10.5px] text-slate-500 pt-2 border-t border-gray-100 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block"></span> Cusco</span>
              <span>Picos de Ocupación: 11:00 am</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 border-l-2 border-red-600 pl-2">Transacciones de Caja Recientes</span>
              <button
                onClick={onClearTransactions}
                className="text-[10.5px] font-semibold text-slate-400 hover:text-red-500"
              >
                Limpiar logs
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.length > 0 ? (
                transactions.map((trx) => (
                  <div key={trx.id} className="p-3 bg-white rounded-xl border border-gray-100 flex justify-between items-center hover:scale-101 transition-all">
                    <div>
                      <span className="text-[10.5px] block font-bold text-slate-950 leading-tight">{trx.destino}</span>
                      <span className="text-[9.5px]/none text-slate-400 block mt-1 font-mono">{trx.fecha} | {trx.metodo}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-extrabold text-slate-900 block">S/ {trx.monto.toFixed(2)}</span>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${trx.estado === 'Éxito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {trx.estado}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 text-center py-4">No se han registrado transferencias en este ciclo.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
