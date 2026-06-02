'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/src/store/app-store'
import {
  SECCIONES_RIOHS, MUTALES, aplicarPlaceholders,
  type RiohsConfig,
} from '@/src/lib/riohs-data'

// ─── Render markdown simple ───────────────────────────────────────────────────

function renderTexto(texto: string) {
  return texto.split('\n').map((linea, i) => {
    const bold = linea.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    if (linea.startsWith('- ') || linea.match(/^\d+\./)) {
      return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.replace(/^[-\d]+[.)]\s*/, '') }} />
    }
    if (!linea.trim()) return <br key={i} />
    return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: bold }} />
  })
}

// ─── Vista imprimible ─────────────────────────────────────────────────────────

function PrintView({ cfg }: { cfg: RiohsConfig }) {
  return (
    <div className="font-sans text-[10.5px] text-slate-800 bg-white p-8 max-w-[800px] mx-auto">
      {/* Portada */}
      <div className="text-center mb-8 pb-6 border-b-2 border-[#1e3a5f]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Logo" style={{ height: '64px', objectFit: 'contain', margin: '0 auto 12px' }} />
        <div className="text-2xl font-bold text-[#1e3a5f] uppercase tracking-wide mt-2">
          REGLAMENTO INTERNO DE ORDEN, HIGIENE Y SEGURIDAD
        </div>
        <div className="text-base font-semibold mt-2">{cfg.empresa || '[NOMBRE EMPRESA]'}</div>
        <div className="text-sm text-slate-500 mt-1">RUT: {cfg.rut || '[RUT]'}</div>
        <div className="text-sm text-slate-500">{cfg.direccion}{cfg.ciudad ? `, ${cfg.ciudad}` : ''}</div>
        <div className="text-sm mt-3 text-slate-600">
          Mutual / Organismo Administrador: <strong>{cfg.mutual || '[MUTUAL]'}</strong>
        </div>
        <div className="text-sm text-slate-500 mt-1">Vigencia: {cfg.fecha || '[FECHA]'}</div>
      </div>

      {/* Introducción */}
      <div className="mb-6">
        <div className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wide mb-2">INTRODUCCIÓN</div>
        <p className="text-[10px] text-slate-600 leading-relaxed">
          El presente Reglamento Interno de Orden, Higiene y Seguridad (RIOHS) ha sido confeccionado por{' '}
          <strong>{cfg.empresa || '[EMPRESA]'}</strong>, RUT <strong>{cfg.rut || '[RUT]'}</strong>, en cumplimiento
          del Art. 153° del Código del Trabajo y del Art. 67° de la Ley N°16.744, y del DS N°44 del Ministerio del
          Trabajo y Previsión Social. Es de conocimiento y cumplimiento obligatorio para todas las personas
          trabajadoras, directivos, jefaturas, subcontratados y terceros que presten servicios en las dependencias
          de <strong>{cfg.empresa || '[EMPRESA]'}</strong>.
        </p>
      </div>

      {/* Secciones y capítulos */}
      {SECCIONES_RIOHS.map(seccion => (
        <div key={seccion.id} className="mb-6">
          <div className="bg-[#1e3a5f] text-white px-4 py-2 font-bold text-[11px] uppercase tracking-wide mb-3 rounded">
            {seccion.titulo}
          </div>
          {seccion.capitulos.map(cap => (
            <div key={cap.id} className="mb-4">
              <div className="font-bold text-[10px] text-[#1e3a5f] uppercase border-b border-slate-200 pb-1 mb-2">
                {cap.titulo}
              </div>
              {cap.parrafo && (
                <div className="text-[9.5px] italic text-slate-500 mb-2">{cap.parrafo}</div>
              )}
              {cap.articulos.map(art => (
                <div key={art.numero} className="mb-3">
                  <div className="font-bold text-[9.5px] text-[#1e3a5f] mb-0.5">{art.numero}</div>
                  <div className="text-[9.5px] text-slate-700 leading-relaxed whitespace-pre-line pl-2">
                    {aplicarPlaceholders(art.texto, cfg)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Firmas */}
      <div className="mt-10 pt-4 border-t-2 border-[#1e3a5f]">
        <div className="font-bold text-[#1e3a5f] text-[10px] uppercase mb-4">FIRMAS DE APROBACIÓN</div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Elaborado por', nombre: cfg.prevencionista, cargo: 'Experto en Prevención de Riesgos' },
            { label: 'Revisado por', nombre: cfg.representante, cargo: 'Representante Legal' },
            { label: 'Aprobado por', nombre: cfg.gerente, cargo: 'Gerente General' },
          ].map(f => (
            <div key={f.label} className="text-center">
              <div className="border-t border-slate-400 pt-2 mt-8">
                <div className="font-semibold text-[9px]">{f.nombre || '____________________'}</div>
                <div className="text-[8.5px] text-slate-500">{f.cargo}</div>
                <div className="text-[8.5px] text-slate-400">{f.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-[8px] text-slate-400">
          {cfg.empresa} · RUT {cfg.rut} · {cfg.ciudad} · Vigente desde {cfg.fecha}
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RiohsPage() {
  const { empresa, centro } = useAppStore()

  const hoy = new Date()
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const fechaDefault = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`

  const [cfg, setCfg] = useState<RiohsConfig>({
    empresa:        '',
    rut:            '',
    actividad:      '',
    direccion:      '',
    ciudad:         '',
    n_trabajadores: '',
    gerente:        '',
    representante:  '',
    prevencionista: '',
    mutual:         MUTALES[0],
    fecha:          fechaDefault,
    ano:            String(hoy.getFullYear()),
  })

  const [tab,        setTab]        = useState<'config' | 'documento' | 'imprimir'>('config')
  const [secOpen,    setSecOpen]    = useState<string>('T1')
  const [capOpen,    setCapOpen]    = useState<string>('')
  const [guardadoOk, setGuardadoOk] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)
  const lsKey    = `riohs_${empresa?.id ?? 'default'}`

  // ── Auto-fill desde store ────────────────────────────────────────────────
  useEffect(() => {
    const totalTrab = centro
      ? (centro.n_trabajadores_hombres ?? 0) + (centro.n_trabajadores_mujeres ?? 0) + (centro.n_trabajadores_otro ?? 0)
      : 0

    setCfg(prev => {
      const saved = (() => { try { const r = localStorage.getItem(lsKey); return r ? JSON.parse(r) : null } catch { return null } })()
      return {
        empresa:        empresa?.razon_social   ?? prev.empresa,
        rut:            empresa?.rut            ?? prev.rut,
        actividad:      empresa?.actividad_economica ?? prev.actividad,
        direccion:      centro?.direccion       ?? prev.direccion,
        ciudad:         empresa?.comuna         ?? prev.ciudad,
        n_trabajadores: totalTrab > 0 ? String(totalTrab) : prev.n_trabajadores,
        gerente:        saved?.gerente        ?? prev.gerente,
        representante:  saved?.representante  ?? prev.representante,
        prevencionista: saved?.prevencionista ?? prev.prevencionista,
        mutual:         saved?.mutual         ?? prev.mutual,
        fecha:          saved?.fecha          ?? prev.fecha,
        ano:            saved?.ano            ?? prev.ano,
      }
    })
  }, [empresa, centro, lsKey])

  const set = (k: keyof RiohsConfig) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCfg(p => ({ ...p, [k]: e.target.value }))

  const handleGuardar = () => {
    try { localStorage.setItem(lsKey, JSON.stringify(cfg)) } catch { /* noop */ }
    setGuardadoOk(true)
    setTimeout(() => setGuardadoOk(false), 2000)
  }

  const handlePrint = () => window.print()

  const handlePDF = async () => {
    if (!printRef.current) return
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('jspdf') as any,
    ])
    printRef.current.style.display = 'block'
    await new Promise(r => setTimeout(r, 200))
    const canvas = await html2canvas(printRef.current, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' })
    printRef.current.style.display = 'none'
    const pdf  = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pdfW) / canvas.width
    let y = 0
    while (y < imgH) {
      if (y > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, -y, pdfW, imgH)
      y += pdfH
    }
    pdf.save(`RIOHS_${cfg.empresa.replace(/\s+/g, '_') || 'empresa'}_${hoy.getFullYear()}.pdf`)
  }

  // ── Campo con label ─────────────────────────────────────────────────────
  const Field = ({ label, k, placeholder, disabled }: {
    label: string; k: keyof RiohsConfig; placeholder?: string; disabled?: boolean
  }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type="text"
        value={cfg[k]}
        onChange={set(k)}
        placeholder={placeholder ?? label}
        disabled={disabled}
        className={`w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] ${disabled ? 'bg-slate-50 text-slate-400' : 'bg-white border-slate-200'}`}
      />
      {disabled && <p className="text-[10px] text-slate-400 mt-0.5">Auto-rellenado desde Levantamiento</p>}
    </div>
  )

  return (
    <>
      {/* Print area */}
      <div ref={printRef} style={{ display: 'none' }} className="print-content">
        <PrintView cfg={cfg} />
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">

        {/* Encabezado */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1e3a5f]">RIOHS — Reglamento Interno de Orden, Higiene y Seguridad</h1>
            <p className="text-sm text-slate-500 mt-0.5">DS 44 · Ley N°16.744 · Código del Trabajo · Ley Karin N°21.643</p>
            {empresa && <p className="text-xs text-slate-400 mt-0.5">{empresa.razon_social}{centro ? ` · ${centro.nombre}` : ''}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleGuardar}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1e3a5f] text-white hover:bg-[#16304f] transition-colors">
              {guardadoOk ? '✓ Guardado' : '💾 Guardar'}
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-colors">
              🖨️ Imprimir
            </button>
            <button onClick={handlePDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              📥 PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-slate-200">
          {([
            { key: 'config',    label: '⚙️ Configuración'  },
            { key: 'documento', label: '📄 Documento'      },
            { key: 'imprimir',  label: '🖨️ Vista Previa'   },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                tab === t.key ? 'border-[#1e3a5f] text-[#1e3a5f] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Configuración ──────────────────────────────────────────── */}
        {tab === 'config' && (
          <div className="space-y-5">
            {/* Datos empresa (auto-fill) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                🏢 Datos de la Empresa
                <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Auto-rellenado desde Levantamiento</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Razón Social"           k="empresa"        disabled />
                <Field label="RUT"                    k="rut"            disabled />
                <Field label="Actividad Económica"    k="actividad"      disabled />
                <Field label="Dirección"              k="direccion"      disabled />
                <Field label="Ciudad / Comuna"        k="ciudad"         disabled />
                <Field label="N° Total Trabajadores"  k="n_trabajadores" disabled />
              </div>
            </div>

            {/* Datos adicionales */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#1e3a5f] mb-4">👤 Representantes y Mutual</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Gerente General"           k="gerente"        placeholder="Nombre completo" />
                <Field label="Representante Legal"        k="representante"  placeholder="Nombre completo" />
                <Field label="Experto en Prevención / Prevencionista" k="prevencionista" placeholder="Nombre completo" />
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mutual / Organismo Administrador (Ley 16.744)</label>
                  <select value={cfg.mutual} onChange={set('mutual')}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]">
                    {MUTALES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <Field label="Fecha de Vigencia"          k="fecha"          placeholder="Ej: 1 de junio de 2026" />
                <Field label="Año"                        k="ano"            placeholder="2026" />
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h2 className="text-sm font-bold text-blue-800 mb-3">📋 Resumen del RIOHS a Generar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Empresa',    val: cfg.empresa || '—'    },
                  { label: 'RUT',        val: cfg.rut     || '—'    },
                  { label: 'Mutual',     val: cfg.mutual  || '—'    },
                  { label: 'Vigencia',   val: cfg.fecha   || '—'    },
                  { label: 'Gerente',    val: cfg.gerente || '—'    },
                  { label: 'Represent.', val: cfg.representante || '—' },
                  { label: 'Prevenc.',   val: cfg.prevencionista || '—' },
                  { label: 'Trabajad.',  val: cfg.n_trabajadores || '—' },
                ].map(c => (
                  <div key={c.label} className="bg-white rounded-lg border border-blue-100 p-2">
                    <div className="text-[10px] text-blue-500 font-semibold">{c.label}</div>
                    <div className="text-slate-700 font-medium truncate">{c.val}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setTab('documento')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Ver Documento →
                </button>
                <button onClick={() => setTab('imprimir')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                  Vista Previa Impresión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Documento ──────────────────────────────────────────────── */}
        {tab === 'documento' && (
          <div className="space-y-3">
            {/* Info completitud */}
            {(!cfg.empresa || !cfg.gerente || !cfg.mutual) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
                ⚠️ Algunos campos no están completos. Ve a <button onClick={() => setTab('config')} className="underline font-semibold">Configuración</button> para rellenar los datos de la empresa.
              </div>
            )}

            {SECCIONES_RIOHS.map(sec => (
              <div key={sec.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header sección */}
                <button
                  onClick={() => setSecOpen(secOpen === sec.id ? '' : sec.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-[#1e3a5f] text-white hover:bg-[#16304f] transition-colors">
                  <span className="font-bold text-sm">{sec.titulo}</span>
                  <span className="text-white/70 text-sm">{secOpen === sec.id ? '▴' : '▾'}</span>
                </button>

                {secOpen === sec.id && (
                  <div className="divide-y divide-slate-100">
                    {sec.capitulos.map(cap => (
                      <div key={cap.id}>
                        {/* Header capítulo */}
                        <button
                          onClick={() => setCapOpen(capOpen === cap.id ? '' : cap.id)}
                          className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors text-left">
                          <div>
                            <span className="font-semibold text-sm text-[#1e3a5f]">{cap.titulo}</span>
                            {cap.parrafo && <span className="text-[11px] text-slate-400 ml-2">— {cap.parrafo}</span>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-[10px] text-slate-400">{cap.articulos.length} art.</span>
                            <span className="text-slate-400 text-xs">{capOpen === cap.id ? '▴' : '▾'}</span>
                          </div>
                        </button>

                        {/* Artículos */}
                        {capOpen === cap.id && (
                          <div className="px-5 pb-4 space-y-4 bg-slate-50/50">
                            {cap.articulos.map(art => (
                              <div key={art.numero} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                                <div className="text-xs font-bold text-[#1e3a5f] mb-2 pb-1 border-b border-slate-100">
                                  {art.numero}
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed space-y-1">
                                  {renderTexto(aplicarPlaceholders(art.texto, cfg))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Vista Previa Impresión ─────────────────────────────────── */}
        {tab === 'imprimir' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between flex-wrap gap-2">
              <span>📄 Esta es la vista previa del documento que se generará al imprimir o exportar como PDF.</span>
              <div className="flex gap-2">
                <button onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-800">
                  🖨️ Imprimir
                </button>
                <button onClick={handlePDF}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  📥 Descargar PDF
                </button>
              </div>
            </div>

            {/* Documento completo en pantalla */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto">
              {/* Portada */}
              <div className="text-center mb-8 pb-6 border-b-2 border-[#1e3a5f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Logo" className="h-16 object-contain mx-auto mb-3" />
                <div className="text-2xl font-bold text-[#1e3a5f] uppercase tracking-wide">
                  Reglamento Interno de Orden, Higiene y Seguridad
                </div>
                <div className="text-lg font-semibold mt-2">{cfg.empresa || '[NOMBRE EMPRESA]'}</div>
                <div className="text-sm text-slate-500 mt-1">RUT: {cfg.rut || '[RUT]'} · {cfg.actividad}</div>
                <div className="text-sm text-slate-500">{cfg.direccion}{cfg.ciudad ? `, ${cfg.ciudad}` : ''}</div>
                <div className="mt-3 text-sm">
                  <span className="font-semibold">Mutual:</span> {cfg.mutual || '[MUTUAL]'}
                </div>
                <div className="text-sm text-slate-500 mt-1">Vigente desde: {cfg.fecha}</div>
              </div>

              {/* Tabla de contenidos */}
              <div className="mb-8">
                <div className="font-bold text-[#1e3a5f] uppercase text-sm tracking-wide mb-3">Contenidos</div>
                {SECCIONES_RIOHS.map(sec => (
                  <div key={sec.id} className="mb-2">
                    <div className="font-bold text-sm text-[#1e3a5f]">{sec.titulo}</div>
                    {sec.capitulos.map(cap => (
                      <div key={cap.id} className="text-xs text-slate-500 ml-4 py-0.5">{cap.titulo}</div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Cuerpo del documento */}
              {SECCIONES_RIOHS.map(sec => (
                <div key={sec.id} className="mb-8">
                  <div className="bg-[#1e3a5f] text-white px-4 py-2.5 font-bold text-sm uppercase tracking-wide rounded mb-4">
                    {sec.titulo}
                  </div>
                  {sec.capitulos.map(cap => (
                    <div key={cap.id} className="mb-5">
                      <div className="font-bold text-[#1e3a5f] text-sm border-b border-slate-200 pb-1 mb-3">
                        {cap.titulo}
                        {cap.parrafo && <span className="font-normal text-slate-500 ml-2 text-xs">— {cap.parrafo}</span>}
                      </div>
                      {cap.articulos.map(art => (
                        <div key={art.numero} className="mb-4">
                          <div className="font-bold text-xs text-[#1e3a5f] mb-1">{art.numero}</div>
                          <div className="text-sm text-slate-700 leading-relaxed pl-3 border-l-2 border-slate-100">
                            {renderTexto(aplicarPlaceholders(art.texto, cfg))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              {/* Firmas */}
              <div className="mt-10 pt-6 border-t-2 border-[#1e3a5f]">
                <div className="font-bold text-[#1e3a5f] uppercase text-sm mb-6">Firmas de Aprobación</div>
                <div className="grid grid-cols-3 gap-8">
                  {[
                    { label: 'Elaborado por',  nombre: cfg.prevencionista, cargo: 'Experto en Prevención de Riesgos' },
                    { label: 'Revisado por',   nombre: cfg.representante,  cargo: 'Representante Legal'              },
                    { label: 'Aprobado por',   nombre: cfg.gerente,        cargo: 'Gerente General'                 },
                  ].map(f => (
                    <div key={f.label} className="text-center">
                      <div className="h-12 border-b border-slate-400 mb-2" />
                      <div className="text-xs font-semibold text-slate-700">{f.nombre || '____________________'}</div>
                      <div className="text-[11px] text-slate-500">{f.cargo}</div>
                      <div className="text-[11px] text-slate-400">{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-content { display: block !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>
    </>
  )
}
