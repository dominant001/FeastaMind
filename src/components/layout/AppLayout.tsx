import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatINRCompact } from '../../utils/currency';
import {
  LayoutDashboard,
  PieChart,
  CheckSquare,
  Calendar,
  Store,
  Sparkles,
  Users,
  Settings,
  FolderKanban,
  Menu,
  X,
  Compass,
  AlertCircle,
  Plus,
  ChevronDown,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react';
import { ProposalModal } from '../budget/ProposalModal';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { OnboardingWizardModal } from '../events/OnboardingWizardModal';
import { LogoShowcaseModal } from '../common/LogoShowcaseModal';
import { Logo } from '../common/Logo';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentTab,
    setCurrentTab,
    copilotOpen,
    setCopilotOpen,
    setOnboardingOpen,
    events,
    activeEventId,
    activeEvent,
    setActiveEventId,
    toasts,
    removeToast,
    isSyncing,
    seedSampleEventToCloud,
    selectedLogoId,
    logoShowcaseOpen,
    setLogoShowcaseOpen,
  } = useApp();

  const {
    user,
    isDemoMode,
    setDemoMode,
    signInWithGoogle,
    signInAsHost,
    signOutUser,
    isOnline,
    authError,
    clearAuthError,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventSwitcherOpen, setEventSwitcherOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget Studio', icon: PieChart },
    { id: 'checklist', label: 'Smart Checklist', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'vendors', label: 'Vendor Hub', icon: Store },
    { id: 'inspiration', label: 'Inspiration', icon: Sparkles },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'events', label: 'My Events', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231530] flex flex-col font-sans">
      {/* Phase 2 Cloud & Auth Banner */}
      <div className="bg-[#231530] text-amber-200/90 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          {isDemoMode ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>
                <strong className="text-white font-semibold">Active Session:</strong> Managing {activeEvent?.name || 'Celebration'} ({(activeEvent?.type || 'wedding').charAt(0).toUpperCase() + (activeEvent?.type || 'wedding').slice(1)}) · Real-time Planning
              </span>
              {!user && (
                <button
                  onClick={() => signInWithGoogle()}
                  className="hidden md:inline-block ml-2 text-white bg-[#E06D28] hover:bg-[#C4551D] px-2 py-0.5 rounded-sm font-semibold transition-colors cursor-pointer"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                <strong className="text-white font-semibold">Cloud Connected:</strong> Firestore Active · {user?.email}
              </span>
              {isSyncing && (
                <span className="flex items-center gap-1 text-white/70 ml-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-4 text-white/60 text-[10px]">
          <span>Asia/Kolkata (IST)</span>
          <span>INR (₹) Standard</span>
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Cloud className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400">
              <CloudOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>
      </div>

      {/* Main Top Header - Redesigned 2-Tier Architecture for Guaranteed Zero Overlap */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#231530]/10 shrink-0 shadow-xs">
        {/* Tier 1: Brand, Event Switcher & Global Actions (Ask AI, Sign In, Menu) */}
        <div className="w-full border-b border-[#231530]/5 px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
            {/* Left: Brand Logo & Event Switcher */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 min-w-0">
              {/* Brand Logo */}
              <button
                onClick={() => setCurrentTab('landing')}
                className="text-left group cursor-pointer shrink-0 transition-transform hover:scale-102"
                title="Go to Landing Overview"
              >
                <Logo variant={selectedLogoId} size="md" tagline={true} />
              </button>

              <div className="hidden sm:block h-5 w-px bg-[#231530]/10 shrink-0" />

              {/* Event Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setEventSwitcherOpen(!eventSwitcherOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 border border-[#231530]/10 rounded-xl text-xs font-medium text-[#231530] transition-colors cursor-pointer"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-semibold max-w-[100px] sm:max-w-[140px] truncate">{activeEvent?.name || 'Celebration'}</span>
                  <span className="hidden sm:inline-block text-[#231530]/50 text-[11px] shrink-0">({activeEvent?.city || 'India'})</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#231530]/50 shrink-0" />
                </button>

                {eventSwitcherOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 bg-white border border-[#231530]/10 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                    <div className="text-[10px] uppercase font-semibold text-[#231530]/50 px-2.5 py-1 flex justify-between">
                      <span>{isDemoMode ? 'Active Local Celebrations' : 'Your Cloud Events'}</span>
                      <span>{events.length}</span>
                    </div>

                    {events.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#231530]/60 space-y-2">
                        <p>No events in your cloud account yet.</p>
                        <button
                          onClick={() => {
                            setEventSwitcherOpen(false);
                            seedSampleEventToCloud();
                          }}
                          className="w-full py-1.5 px-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold hover:bg-amber-100"
                        >
                          Import Baseline Celebration
                        </button>
                      </div>
                    ) : (
                      events.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => {
                            setActiveEventId(ev.id);
                            setEventSwitcherOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            ev.id === activeEventId
                              ? 'bg-[#E06D28]/10 text-[#E06D28] font-semibold'
                              : 'hover:bg-[#FAF7F2] text-[#231530]'
                          }`}
                        >
                          <div className="truncate">
                            <div>{ev.name}</div>
                            <div className="text-[10px] text-[#231530]/50 font-normal">
                              {ev.city} · {formatINRCompact(ev.totalBudget)}
                            </div>
                          </div>
                          {ev.id === activeEventId && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E06D28]" />
                          )}
                        </button>
                      ))
                    )}

                    <div className="pt-1 border-t border-[#231530]/5 space-y-1">
                      <button
                        onClick={() => {
                          setEventSwitcherOpen(false);
                          setOnboardingOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#E06D28] hover:bg-[#E06D28]/5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Plan New Celebration</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Ask Festa Mind Copilot, Auth Identity & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
              {/* Ask Festa Mind Copilot trigger */}
              <button
                onClick={() => setCopilotOpen(!copilotOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-[#E06D28] to-[#C4551D] hover:from-[#C4551D] hover:to-[#A34215] text-white rounded-xl text-xs font-semibold transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer shrink-0"
                title="Open Festa Mind Copilot Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="hidden sm:inline">Ask Festa Mind</span>
                <span className="sm:hidden font-medium">Copilot</span>
              </button>

              {/* Auth Identity Pill / Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-white border border-[#231530]/15 rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer text-xs shrink-0"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#231530] text-white flex items-center justify-center font-bold text-[10px]">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="hidden sm:inline font-semibold max-w-[100px] truncate text-[#231530]">
                      {user.displayName?.split(' ')[0] || user.email}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#231530]/50" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#231530]/10 rounded-xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                      <div className="px-3 py-2 border-b border-[#231530]/5">
                        <div className="font-semibold text-xs text-[#231530] truncate">
                          {user.displayName || 'Celebration Host'}
                        </div>
                        <div className="text-[10px] text-[#231530]/50 truncate">{user.email}</div>
                      </div>

                      <button
                        onClick={() => {
                          setDemoMode(!isDemoMode);
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#231530] hover:bg-[#FAF7F2] rounded-lg flex items-center justify-between cursor-pointer"
                      >
                        <span>{isDemoMode ? 'Switch to Cloud Firestore' : 'Switch to Local Storage'}</span>
                        <span className="text-[10px] text-[#E06D28] font-semibold">
                          {isDemoMode ? 'Cloud' : 'Local'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          signOutUser();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#231530] text-white hover:bg-[#3A2350] rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="Sign in with Google to enable Cloud Firestore persistence"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile Hamburger Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-[#231530] hover:bg-[#FAF7F2] rounded-xl transition-colors cursor-pointer border border-[#231530]/10"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Dedicated Navigation Strip - Guarantees Zero Overlap with Action Buttons */}
        <div className="w-full px-3 sm:px-6 py-1.5 bg-[#FFFFFF]/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            {/* Scrollable Navigation Pill Strip */}
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 scrollbar-none w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#231530] text-white shadow-xs font-semibold scale-102'
                        : 'text-[#231530]/70 hover:text-[#231530] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E06D28]' : 'text-[#231530]/50'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Context Tag on Large Screens */}
            <div className="hidden 2xl:flex items-center gap-2 text-[11px] text-[#231530]/50 shrink-0 pl-2">
              <span className="font-mono font-medium text-[#231530]/70">{formatINRCompact(activeEvent?.totalBudget || 0)} Budget</span>
              <span>·</span>
              <span>{activeEvent?.guestCount || 0} Guests</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-3 sm:px-6 pt-3 pb-3 border-t border-[#231530]/10 grid grid-cols-2 sm:grid-cols-3 gap-1.5 animate-in fade-in duration-150">
            <button
              onClick={() => {
                setCurrentTab('landing');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg text-xs font-medium text-left bg-neutral-100 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#E06D28]" />
              <span>Landing Overview</span>
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-[#231530] text-white font-semibold'
                      : 'hover:bg-[#FAF7F2] text-[#231530]/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[#231530]/10 flex items-center justify-between px-2">
              {user ? (
                <button
                  onClick={() => {
                    signOutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-700 flex items-center gap-1.5 py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out ({user.displayName?.split(' ')[0] || user.email})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-[#E06D28] flex items-center gap-1.5 py-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Auth error alert banner if sign-in fails */}
        {authError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5 max-w-3xl">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{authError}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setDemoMode(true);
                  clearAuthError();
                }}
                className="px-3 py-1.5 bg-[#231530] hover:bg-[#3A2350] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue in Planner Mode
              </button>
              <button
                onClick={clearAuthError}
                className="px-2.5 py-1.5 text-amber-800 hover:text-amber-950 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* Floating Ask Festa Mind trigger */}
      {!copilotOpen && (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#231530] text-white hover:bg-[#3A2350] p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer border border-amber-300/30"
          title="Open Festa Mind Copilot Drawer"
        >
          <div className="w-6 h-6 rounded-full bg-[#E06D28] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="hidden sm:inline">Ask Festa Mind</span>
        </button>
      )}

      {/* Interactive Toasts Container */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl text-xs font-medium shadow-lg flex items-start gap-2.5 border transition-all animate-in slide-in-from-bottom duration-200 ${
              toast.type === 'success'
                ? 'bg-white text-emerald-900 border-emerald-200'
                : toast.type === 'warning'
                ? 'bg-white text-amber-900 border-amber-200'
                : toast.type === 'error'
                ? 'bg-white text-rose-900 border-rose-200'
                : 'bg-white text-[#231530] border-[#231530]/15'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-600'
                  : toast.type === 'warning'
                  ? 'bg-amber-600'
                  : toast.type === 'error'
                  ? 'bg-rose-600'
                  : 'bg-[#E06D28]'
              }`}
            />
            <div className="flex-1 leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#231530]/40 hover:text-[#231530] ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Persistent Modals & Drawers */}
      <CopilotDrawer />
      <ProposalModal />
      <OnboardingWizardModal />
      <LogoShowcaseModal isOpen={logoShowcaseOpen} onClose={() => setLogoShowcaseOpen(false)} />

      {/* Domain Authorization Guidance Modal */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#231530]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#231530]/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#231530]/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  🔐
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#231530]">Firebase Auth Authorized Domains</h3>
                  <p className="text-[11px] text-[#231530]/60">Google OAuth Origin Setup for Preview URL</p>
                </div>
              </div>
              <button
                onClick={() => setDomainModalOpen(false)}
                className="p-1 rounded-lg text-[#231530]/50 hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#231530]/80 leading-relaxed">
                Google OAuth requires preview hostnames to be listed under <strong>Authorized Domains</strong> in your Firebase Console project settings to complete popup sign-ins.
              </p>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#231530]/10 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-[#231530]">Current Preview Hostname:</span>
                  <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {typeof window !== 'undefined' ? window.location.hostname : 'run.app'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-[#231530]">Firebase Project ID:</span>
                  <span className="font-mono text-neutral-700">gen-lang-client-0830839315</span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-[#231530]">Firestore Database ID:</span>
                  <span className="font-mono text-neutral-700 truncate max-w-[200px]">ai-studio-utsavai-...</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="font-semibold text-xs text-[#231530]">Steps to add in Firebase Console:</div>
                <ol className="list-decimal list-inside text-[11px] text-[#231530]/70 space-y-1">
                  <li>Open <a href="https://console.firebase.google.com/u/0/project/gen-lang-client-0830839315/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-[#E06D28] underline font-medium">Firebase Auth Settings</a></li>
                  <li>Scroll to <strong>Authorized Domains</strong> and click <strong>Add Domain</strong></li>
                  <li>Paste domain: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">{typeof window !== 'undefined' ? window.location.hostname : ''}</code></li>
                </ol>
              </div>
            </div>

            <div className="pt-2 border-t border-[#231530]/10 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(window.location.hostname);
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2000);
                  }
                }}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 border border-[#231530]/15 text-[#231530] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>{copiedDomain ? 'Copied to Clipboard!' : 'Copy Domain URL'}</span>
              </button>

              <button
                onClick={() => {
                  signInAsHost();
                  setDomainModalOpen(false);
                }}
                className="px-4 py-2 bg-[#E06D28] hover:bg-[#C4551D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Sign in as Host (97amsingh@gmail.com)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
