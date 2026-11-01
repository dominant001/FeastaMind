import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck,
  Plus,
  X,
  Lock,
} from 'lucide-react';
import { BudgetCategory, VendorQuote } from '../../types';
import { formatINR, formatINRCompact } from '../../utils/currency';

interface CategoryExpenseCardProps {
  cat: BudgetCategory;
  isExpanded: boolean;
  setExpandedCategoryId: (id: string | null) => void;
  matchingQuotes: VendorQuote[];
  finalizedQuote?: VendorQuote | null;
  vendorQuotes: VendorQuote[];
  finalizeVendorForCategory: (quoteId: string, categoryId?: string) => void;
  unfinalizeVendorForCategory: (categoryId: string) => void;
  setNewQuoteData: React.Dispatch<
    React.SetStateAction<{
      vendorName: string;
      category: string;
      city: string;
      rating: number;
      chargeBasis: string;
      rate: number;
      quantity: number;
      taxes: number;
      extras: number;
      inclusions: string;
      exclusions: string;
      validityDate: string;
    }>
  >;
  setQuoteModalOpen: (open: boolean) => void;
  openPaymentModal: (cat: BudgetCategory) => void;
}

export const CategoryExpenseCard: React.FC<CategoryExpenseCardProps> = ({
  cat,
  isExpanded,
  setExpandedCategoryId,
  matchingQuotes,
  finalizedQuote,
  vendorQuotes,
  finalizeVendorForCategory,
  unfinalizeVendorForCategory,
  setNewQuoteData,
  setQuoteModalOpen,
  openPaymentModal,
}) => {
  const isFinalized = Boolean(cat.selectedVendorName || finalizedQuote);
  const finalVendorName = cat.selectedVendorName || finalizedQuote?.vendorName;
  const isQuoted = !isFinalized && (matchingQuotes.length > 0 || cat.sourceType === 'quoted');
  const isVerified = !isFinalized && !isQuoted && cat.sourceType === 'verified';

  return (
    <React.Fragment>
      <tr
        onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
        className={`hover:bg-[#FAF7F2]/60 cursor-pointer transition-colors ${
          isExpanded ? 'bg-[#FAF7F2]/40' : ''
        }`}
      >
        <td className="p-4 font-semibold text-[#231530]">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="font-semibold">{cat.name}</span>
            {cat.isContingency && (
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-sm font-semibold">
                Reserve
              </span>
            )}
          </div>
          {cat.advanceNotes && (
            <div className="text-[10px] text-[#231530]/50 font-normal italic pl-4.5 mt-0.5 truncate max-w-[160px]">
              {cat.advanceNotes}
            </div>
          )}
        </td>

        {/* Evidence Provenance Column */}
        <td className="p-4">
          {isFinalized ? (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-tight">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>CONTRACT FINALIZED</span>
              </span>
              <div className="text-[10px] text-emerald-700 font-medium truncate max-w-[140px]">
                {finalVendorName}
              </div>
            </div>
          ) : isQuoted ? (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 uppercase tracking-tight">
                <span>VENDOR QUOTED ({matchingQuotes.length})</span>
              </span>
              <div className="text-[10px] text-sky-700/80">
                {matchingQuotes.length} quote{matchingQuotes.length > 1 ? 's' : ''} available
              </div>
            </div>
          ) : isVerified ? (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase tracking-tight">
                <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                <span>VERIFIED OFFER</span>
              </span>
              <div className="text-[10px] text-teal-700/80">Verified market quote</div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase tracking-tight">
                <span>BUDGET ESTIMATE</span>
              </span>
              <div className="text-[10px] text-[#231530]/50">Market baseline estimate</div>
            </div>
          )}
        </td>

        {/* Final Vendor Selection Column */}
        <td className="p-4">
          {isFinalized ? (
            <div className="inline-flex items-center justify-between gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg max-w-[180px]">
              <div className="flex items-center gap-1 min-w-0">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-950 text-xs truncate" title={finalVendorName}>
                  {finalVendorName}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  unfinalizeVendorForCategory(cat.id);
                }}
                className="text-neutral-400 hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors"
                title="Remove vendor selection"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : matchingQuotes.length > 0 ? (
            <select
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.value) {
                  finalizeVendorForCategory(e.target.value, cat.id);
                }
              }}
              defaultValue=""
              className="text-xs px-2 py-1 bg-white border border-[#231530]/20 hover:border-[#E06D28] rounded-lg text-[#231530] font-medium cursor-pointer focus:outline-hidden"
            >
              <option value="" disabled>+ Finalize Vendor ({matchingQuotes.length})</option>
              {matchingQuotes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.vendorName} ({formatINRCompact(q.totalCalculated)})
                </option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setNewQuoteData((prev) => ({ ...prev, category: cat.name }));
                setQuoteModalOpen(true);
              }}
              className="text-[11px] text-[#231530]/50 hover:text-[#E06D28] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3 text-[#E06D28]" />
              <span>Add Quote</span>
            </button>
          )}
        </td>

        {/* Estimate Range */}
        <td className="p-4 text-right font-mono tabular-nums text-[#231530]/70">
          {formatINRCompact(cat.estimatedLow)} – {formatINRCompact(cat.estimatedHigh)}
        </td>

        {/* Allocated */}
        <td className="p-4 text-right font-mono tabular-nums font-bold text-[#231530]">
          {formatINR(cat.allocated)}
        </td>

        {/* Committed */}
        <td className="p-4 text-right font-mono tabular-nums text-[#231530]/80">
          {formatINR(cat.committed)}
        </td>

        {/* Paid & Advance Column (With Lock Indicator) */}
        <td className="p-4 text-right">
          <div
            onClick={(e) => {
              e.stopPropagation();
              openPaymentModal(cat);
            }}
            className="group/paid inline-flex flex-col items-end cursor-pointer p-1.5 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors"
            title="Click to Record or Lock Advance Payment"
          >
            <div className="flex items-center gap-1.5">
              {cat.isPaidLocked ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                  <Lock className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Locked</span>
                </span>
              ) : cat.paid > 0 ? (
                <span className="text-[9px] text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                  Unlocked
                </span>
              ) : null}
              <span className="font-mono tabular-nums font-bold text-emerald-700 text-xs">
                {formatINR(cat.paid)}
              </span>
            </div>
            <span className="text-[10px] text-[#231530]/50 group-hover/paid:text-[#E06D28] group-hover/paid:underline mt-0.5">
              {cat.isPaidLocked ? 'Locked Advance' : cat.paid > 0 ? 'Lock Advance' : '+ Record Advance'}
            </span>
          </div>
        </td>

        {/* Inclusions Chevron */}
        <td className="p-4 text-center text-[#231530]/50">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 mx-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 mx-auto" />
          )}
        </td>
      </tr>

      {/* Drilldown Row */}
      {isExpanded && (
        <tr className="bg-[#FAF7F2]/80">
          <td colSpan={8} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Inclusions & Exclusions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="font-semibold text-emerald-800 uppercase tracking-wider text-[11px]">
                    Included in this Estimate:
                  </span>
                  <ul className="space-y-1 text-[#231530]/80">
                    {cat.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-rose-800 uppercase tracking-wider text-[11px]">
                    Explicitly Excluded (Review for Surcharges):
                  </span>
                  <ul className="space-y-1 text-[#231530]/80">
                    {cat.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Advance Payment & Financial Lock Card */}
              <div className="p-4 bg-white rounded-xl border border-[#231530]/10 space-y-3">
                <div className="flex items-center justify-between border-b border-[#231530]/10 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#231530] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#E06D28]" />
                    <span>Payment &amp; Advance Lock</span>
                  </span>
                  {cat.isPaidLocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Locked Advance</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      Unlocked (Draft)
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#231530]/70">
                    <span>Allocated:</span>
                    <span className="font-semibold text-[#231530]">{formatINR(cat.allocated)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Advance Paid:</span>
                    <span className="font-bold">{formatINR(cat.paid)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 pt-1 border-t border-[#231530]/5">
                    <span>Balance Due:</span>
                    <span className="font-bold">{formatINR(Math.max(0, cat.allocated - cat.paid))}</span>
                  </div>
                </div>

                {cat.advanceNotes && (
                  <p className="text-[11px] text-[#231530]/65 italic bg-[#FAF7F2] p-2 rounded-lg border border-[#231530]/5">
                    "{cat.advanceNotes}"
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => openPaymentModal(cat)}
                  className="w-full py-2 bg-[#FAF7F2] hover:bg-emerald-50 text-xs font-semibold text-[#231530] hover:text-emerald-900 border border-[#231530]/15 hover:border-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {cat.isPaidLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manage / Unlock Payment</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#E06D28]" />
                      <span>Record &amp; Lock Advance</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vendor Procurement & Provenance Checks */}
              <div className="p-4 bg-white rounded-xl border border-[#231530]/10 space-y-3">
                <div className="flex items-center justify-between border-b border-[#231530]/10 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#231530]">
                    Vendor Procurement Status
                  </span>
                  {finalizedQuote ? (
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                      Finalized
                    </span>
                  ) : matchingQuotes.length > 0 ? (
                    <span className="text-[10px] font-bold text-sky-700 uppercase bg-sky-50 px-1.5 py-0.5 rounded">
                      {matchingQuotes.length} Quotes Logged
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#231530]/50 uppercase">Open Estimate</span>
                  )}
                </div>

                {matchingQuotes.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] text-[#231530]/60 font-medium">Logged Quotations:</span>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                      {matchingQuotes.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[#231530] truncate">{q.vendorName}</div>
                            <div className="text-[10px] text-[#231530]/60">{formatINR(q.totalCalculated)}</div>
                          </div>
                          {q.status === 'finalized' ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Final
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => finalizeVendorForCategory(q.id, cat.id)}
                              className="text-[10px] font-bold text-[#E06D28] hover:underline cursor-pointer"
                            >
                              Finalize
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#231530]/60 leading-relaxed">
                    No vendor quotations logged for {cat.name} yet. Log a vendor quote or search recommended vendor listings.
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};
