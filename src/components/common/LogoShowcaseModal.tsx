import React, { useState } from 'react';
import { LOGO_CONCEPTS, LogoMark, LogoVariant } from './Logo';
import { useApp } from '../../context/AppContext';
import { X, Check, Copy, Download, Sparkles, Layers, ShieldCheck, Palette } from 'lucide-react';

interface LogoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoShowcaseModal: React.FC<LogoShowcaseModalProps> = ({ isOpen, onClose }) => {
  const { selectedLogoId, setSelectedLogoId, showToast } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'brand'>('light');

  if (!isOpen) return null;

  const activeConcept = LOGO_CONCEPTS.find((c) => c.id === selectedLogoId) || LOGO_CONCEPTS[0];

  const handleSelectLogo = (id: LogoVariant) => {
    setSelectedLogoId(id);
    const concept = LOGO_CONCEPTS.find((c) => c.id === id);
    showToast(`Updated active app logo to "${concept?.title || id}"!`, 'success');
  };

  const handleCopySvg = (id: LogoVariant) => {
    // Generate inline SVG string
    const svgElement = document.getElementById(`logo-svg-src-${id}`);
    if (svgElement) {
      const svgString = svgElement.outerHTML;
      navigator.clipboard.writeText(svgString);
      setCopiedId(id);
      showToast('SVG source code copied to clipboard!', 'info');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDownloadSvg = (id: LogoVariant, name: string) => {
    const svgElement = document.getElementById(`logo-svg-src-${id}`);
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `festa-mind-logo-${id}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast(`Downloaded ${name} SVG file!`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#231530]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#231530]/15 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#231530] via-[#3A1C4D] to-[#231530] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E06D28] text-white flex items-center justify-center shadow-lg">
              <Palette className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl text-white">Festa Mind Logo Studio</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-300/30 px-2.5 py-0.5 rounded-full">
                  Interactive Showcase
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-medium">
                Choose, preview, and download official brand logo designs for Festa Mind
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Controls Strip */}
        <div className="px-6 py-3 bg-[#FAF7F2] border-b border-[#231530]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#231530]/70">Preview Background:</span>
            <div className="flex items-center bg-white border border-[#231530]/15 rounded-xl p-1 gap-1">
              <button
                onClick={() => setPreviewBg('light')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewBg === 'light' ? 'bg-[#FAF7F2] text-[#231530] font-bold shadow-xs' : 'text-[#231530]/60'
                }`}
              >
                Light Ivory
              </button>
              <button
                onClick={() => setPreviewBg('dark')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewBg === 'dark' ? 'bg-[#231530] text-amber-200 font-bold shadow-xs' : 'text-[#231530]/60'
                }`}
              >
                Deep Purple
              </button>
              <button
                onClick={() => setPreviewBg('brand')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  previewBg === 'brand' ? 'bg-[#E06D28] text-white font-bold shadow-xs' : 'text-[#231530]/60'
                }`}
              >
                Terracotta
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#231530]/70 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Currently Active: <strong className="text-[#E06D28] font-bold">{activeConcept.title}</strong></span>
          </div>
        </div>

        {/* Content Body: Grid of Logo Concepts */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LOGO_CONCEPTS.map((concept) => {
              const isSelected = selectedLogoId === concept.id;
              const isCopied = copiedId === concept.id;

              return (
                <div
                  key={concept.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative group ${
                    isSelected
                      ? 'border-[#E06D28] ring-2 ring-[#E06D28]/30 bg-white shadow-xl scale-[1.01]'
                      : 'border-[#231530]/12 bg-white hover:border-[#E06D28]/50 hover:shadow-md'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10 bg-[#E06D28] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Check className="w-3 h-3" />
                      <span>Active Logo</span>
                    </div>
                  )}

                  {/* Logo Display Stage */}
                  <div
                    className={`p-8 flex flex-col items-center justify-center relative transition-colors duration-200 min-h-[190px] ${
                      previewBg === 'dark'
                        ? 'bg-[#231530]'
                        : previewBg === 'brand'
                        ? 'bg-[#E06D28]'
                        : 'bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <div id={`logo-svg-src-${concept.id}`}>
                        <LogoMark
                          variant={concept.id}
                          dimension={72}
                        />
                      </div>
                    </div>

                    {/* App Brand Name Typography Mockup */}
                    <div className="mt-4 flex items-center gap-2 text-center">
                      <span
                        className={`font-display font-bold text-2xl tracking-tight ${
                          previewBg === 'light' ? 'text-[#231530]' : 'text-white'
                        }`}
                      >
                        Festa<span className={previewBg === 'brand' ? 'text-amber-200' : 'text-[#E06D28]'}>Mind</span>
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-medium tracking-wide mt-0.5 ${
                        previewBg === 'light' ? 'text-[#231530]/60' : 'text-white/80'
                      }`}
                    >
                      You celebrate. We plan.
                    </span>
                  </div>

                  {/* Details & Info */}
                  <div className="p-4 bg-white flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] bg-[#E06D28]/10 px-2 py-0.5 rounded-md">
                          {concept.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {concept.accentColors.map((col, idx) => (
                            <span
                              key={idx}
                              className="w-3 h-3 rounded-full border border-black/10 shadow-2xs"
                              style={{ backgroundColor: col }}
                              title={`Color ${col}`}
                            />
                          ))}
                        </div>
                      </div>

                      <h3 className="font-display font-bold text-base text-[#231530]">
                        {concept.title}
                      </h3>
                      <p className="text-[11px] text-[#231530]/50 font-semibold mb-2">
                        {concept.subtitle}
                      </p>
                      <p className="text-xs text-[#231530]/75 leading-relaxed">
                        {concept.description}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#231530]/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSelectLogo(concept.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-[#231530] hover:bg-[#3A2350] text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied as Logo</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Select Logo</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopySvg(concept.id)}
                        className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 border border-[#231530]/15 text-[#231530] transition-colors cursor-pointer"
                        title="Copy SVG Code"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#231530]/70" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDownloadSvg(concept.id, concept.title)}
                        className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 border border-[#231530]/15 text-[#231530] transition-colors cursor-pointer"
                        title="Download SVG File"
                      >
                        <Download className="w-4 h-4 text-[#231530]/70" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Application Preview Bar */}
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E06D28]" />
              <h4 className="font-bold text-xs text-[#231530] uppercase tracking-wider">
                Live App Header Integration Preview
              </h4>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#231530]/10 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <LogoMark variant={selectedLogoId} dimension={36} />
                <div>
                  <div className="font-display font-bold text-lg text-[#231530]">
                    Festa<span className="text-[#E06D28]">Mind</span>
                  </div>
                  <div className="text-[10px] text-[#231530]/60 font-medium">
                    You celebrate. We plan.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#231530]/70 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#231530]/10">
                  Dashboard · Budget Studio · Smart Checklist
                </span>
                <span className="px-3 py-1.5 bg-[#E06D28] text-white text-xs font-semibold rounded-lg shadow-xs">
                  Ask Festa Mind
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#231530]/10 flex items-center justify-between">
          <span className="text-xs text-[#231530]/60 font-medium">
            All logo assets are vector SVGs scale-ready for mobile, web, print & merchandise.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#231530] hover:bg-[#3A2350] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
