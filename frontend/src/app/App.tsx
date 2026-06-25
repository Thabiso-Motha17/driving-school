import { useState, useRef, useEffect, useCallback } from "react";
import {
  Menu, X, Phone, Mail, ChevronRight, Star,
  BookOpen, Calendar, TrendingUp, Users, Shield, CheckCircle,
  Clock, Car, Truck, Bike, FileText, LogIn, ArrowRight,
  Bell, MessageSquare, BarChart2, Settings, CreditCard,
  AlertCircle, ChevronDown, Send,
  Lock, Eye, EyeOff, UserPlus, Download, Printer,
  Upload, ThumbsUp, ThumbsDown, ClipboardList,
   XCircle, HelpCircle, ArrowLeft, Home
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Portal = "student" | "instructor" | "admin" | null;
type NavSection = "home" | "services" | "portals" | "about" | "contact";
type ModalType = "login" | "register" | null;

type PaymentStatus = "pending" | "approved" | "rejected";

interface PendingPayment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseCode: string;
  courseLabel: string;
  planLabel: string;
  planPrice: number;
  addons: string[];
  total: number;
  proofFilename: string;
  submittedAt: string;
  status: PaymentStatus;
  reviewNote?: string;
}

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const RED = "#c8101e";
const BLACK = "#0d0d0d";

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  { code: "Code 8", label: "Light Motor Vehicle", icon: Car, color: RED, perLesson: 220, bundles: [{ qty: 5, price: 1100 }, { qty: 10, price: 2200 }], hire: { label: "Car Hire", price: 900 }, transport: 200 },
  { code: "Code 10", label: "Heavy Motor Vehicle", icon: Truck, color: BLACK, perLesson: 250, bundles: [{ qty: 5, price: 1250 }, { qty: 10, price: 2500 }], hire: { label: "Truck Hire", price: 1100 }, transport: 200 },
  { code: "Code 14", label: "Extra Heavy Vehicle", icon: Truck, color: RED, perLesson: 400, bundles: [{ qty: 5, price: 2000 }, { qty: 10, price: 4000 }], hire: { label: "Truck Hire", price: 1800 }, transport: 200 },
  { code: "Code 1", label: "Motorcycle", icon: Bike, color: BLACK, perLesson: 200, bundles: [{ qty: 5, price: 1000 }, { qty: 10, price: 2000 }], hire: { label: "Bike Hire", price: 750 }, transport: 200 },
];

const QUIZ_QUESTIONS = [
  { q: "What does a solid white line in the centre of the road mean?", options: ["You may overtake if safe", "No overtaking permitted", "Road works ahead", "Stop ahead"], answer: 1 },
  { q: "At an intersection with no signs or signals, who has right of way?", options: ["The vehicle on the left", "The vehicle on the right", "The larger vehicle", "The first vehicle to arrive"], answer: 1 },
  { q: "What is the minimum following distance at 120 km/h on a freeway?", options: ["2 seconds", "3 seconds", "4 seconds", "6 seconds"], answer: 1 },
  { q: "A yellow line at the edge of the road means:", options: ["No parking at any time", "Parking permitted for 30 min", "No stopping between indicated times", "Loading zone only"], answer: 0 },
  { q: "When must you switch on your headlights?", options: ["Only at night", "From 30 min after sunset to 30 min before sunrise", "Only in fog", "When it is overcast"], answer: 1 },
  { q: "What is the speed limit in an urban area unless otherwise indicated?", options: ["60 km/h", "80 km/h", "100 km/h", "40 km/h"], answer: 0 },
  { q: "A pedestrian is crossing at a marked crossing. You must:", options: ["Hoot to warn them", "Accelerate to pass quickly", "Stop and give way", "Flash your lights"], answer: 2 },
  { q: "What does a red circle road sign indicate?", options: ["Warning", "Information", "Prohibition", "Direction"], answer: 2 },
];

const TESTIMONIALS = [
  { name: "Sipho Dlamini", role: "Code 8 Graduate", text: "Passed first time! The instructors were patient and professional. The online booking made scheduling a breeze.", rating: 5 },
  { name: "Nomsa Khumalo", role: "Learners License Student", text: "The study materials on the portal helped me prepare thoroughly. Excellent transport arrangements too.", rating: 5 },
  { name: "Thabo Mokoena", role: "Code 10 Graduate", text: "Professional service from start to finish. The bundle packages offer real value for money.", rating: 5 },
];

const MESSAGES = [
  { from: "NB Jama", role: "Instructor", time: "09:14", text: "Good morning Lerato! Just a reminder your lesson tomorrow is at 09:00. Please be ready 5 minutes early.", mine: false },
  { from: "Me", role: "Student", time: "09:32", text: "Good morning! I will be ready. Should I bring the K53 book?", mine: true },
  { from: "NB Jama", role: "Instructor", time: "09:35", text: "Yes, please bring it. We will review road signs at the start. See you then!", mine: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bb(style?: string) { return { fontFamily: "'Barlow Condensed', sans-serif", ...( style ? {} : {}) }; }

function SectionLabel({ children }: { children: string }) {
  return <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{children}</div>;
}

function RedBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`bg-primary text-white font-bold uppercase tracking-wider text-sm px-5 py-3 hover:opacity-90 transition-opacity ${className}`}>
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`border border-border text-foreground font-bold uppercase tracking-wider text-sm px-5 py-3 hover:border-primary hover:text-primary transition-colors ${className}`}>
      {children}
    </button>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims: Record<string, number> = { sm: 36, md: 48, lg: 72 };
  const d = dims[size];
  const ts: Record<string, string> = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };
  const ss: Record<string, string> = { sm: "text-[9px] tracking-[0.12em]", md: "text-[10px] tracking-[0.15em]", lg: "text-xs tracking-[0.2em]" };
  return (
    <div className="flex items-center gap-3">
      <svg width={d} height={d} viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" fill={RED} />
        <circle cx="32" cy="38" r="16" stroke="white" strokeWidth="3.5" fill="none" />
        <circle cx="32" cy="38" r="5" fill="white" />
        <line x1="32" y1="33" x2="32" y2="22" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="27.3" y1="35.5" x2="18.4" y2="30.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="36.7" y1="35.5" x2="45.6" y2="30.5" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M10 22 C14 18,22 16,32 18 C42 16,50 18,54 22 C48 20,40 24,32 22 C24 24,16 20,10 22Z" fill="white" />
        <ellipse cx="32" cy="14" rx="4" ry="5" fill="white" />
        <polygon points="32,10 35,12 32,13" fill={RED} />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`font-black uppercase tracking-tight text-foreground ${ts[size]}`} style={bb()}>Nthlakusani & Jama</span>
        <span className={`text-primary uppercase font-semibold ${ss[size]}`} style={bb()}>Driving School & Shuttle Services</span>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-primary text-primary" : "fill-muted text-muted"} />
      ))}
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ service, onPurchase }: { service: typeof SERVICES[0]; onPurchase: (s: typeof SERVICES[0]) => void }) {
  const Icon = service.icon;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-card border border-border flex flex-col">
      <div className="p-5 flex items-center gap-3 border-b border-border" style={{ backgroundColor: service.color }}>
        <Icon size={22} className="text-white shrink-0" />
        <div>
          <div className="text-white text-2xl font-black uppercase leading-none" style={bb()}>{service.code}</div>
          <div className="text-white/80 text-xs font-medium tracking-wide">{service.label}</div>
        </div>
      </div>
      <div className="px-5 py-4 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pay-as-you-go</div>
        <div className="text-3xl font-black text-foreground" style={bb()}>R{service.perLesson}<span className="text-base font-normal text-muted-foreground"> / lesson</span></div>
      </div>
      <div className="px-5 py-4 border-b border-border space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Plan Packages</div>
        {service.bundles.map((b, i) => (
          <div key={b.qty} className={`flex justify-between items-center px-3 py-2 ${i === 1 ? "bg-primary/8 border border-primary/20" : "bg-muted/40"}`}>
            <div>
              <span className="text-sm font-semibold">{b.qty}-Lesson Plan</span>
              {i === 1 && <span className="ml-2 text-[10px] bg-primary text-white font-bold px-1.5 py-0.5">BEST VALUE</span>}
            </div>
            <span className="text-base font-black text-primary" style={bb()}>R{b.price.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setExpanded(!expanded)} className="px-5 py-3 flex items-center justify-between text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <span>Hire & Transport Add-ons</span>
        <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-2 border-t border-border pt-3">
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">{service.hire.label}</span><span className="text-sm font-bold">R{service.hire.price}</span></div>
          <div className="flex justify-between"><span className="text-sm text-muted-foreground">Transport (per lesson)</span><span className="text-sm font-bold">R{service.transport}</span></div>
        </div>
      )}
      <div className="p-4 mt-auto">
        <button
          onClick={() => onPurchase(service)}
          className="w-full py-2.5 text-sm font-bold uppercase tracking-wider transition-opacity hover:opacity-90 text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: service.color, ...bb() }}
        >
          <CreditCard size={14} /> Purchase Plan
        </button>
      </div>
    </div>
  );
}

// ─── Purchase Plan Modal ──────────────────────────────────────────────────────

type PlanOption = { qty: number; price: number; label: string };
type PurchaseStep = "login" | "plan" | "addons" | "proof" | "submitted";

function PurchasePlanModal({
  service, onClose, isLoggedIn, onAddPending,
}: {
  service: typeof SERVICES[0] | null;
  onClose: () => void;
  isLoggedIn: boolean;
  onAddPending: (p: PendingPayment) => void;
}) {
  const fallback = SERVICES[0];
  const svc = service ?? fallback;

  const planOptions: PlanOption[] = [
    { qty: 1, price: svc.perLesson, label: "Single Lesson" },
    ...svc.bundles.map(b => ({ qty: b.qty, price: b.price, label: `${b.qty}-Lesson Plan` })),
  ];

  const [step, setStep] = useState<PurchaseStep>(isLoggedIn ? "plan" : "login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(planOptions[2] ?? planOptions[0]);
  const [withTransport, setWithTransport] = useState(false);
  const [withHire, setWithHire] = useState(false);

  // Proof of payment
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const transportCost = withTransport ? svc.transport * selectedPlan.qty : 0;
  const hireCost = withHire ? svc.hire.price : 0;
  const total = selectedPlan.price + transportCost + hireCost;
  const saving = selectedPlan.qty > 1 ? (svc.perLesson * selectedPlan.qty) - selectedPlan.price : 0;

  const FLOW_STEPS: PurchaseStep[] = ["login", "plan", "addons", "proof", "submitted"];
  const STEP_LABELS = ["Login", "Plan", "Add-ons", "Proof", "Done"];
  const stepIdx = FLOW_STEPS.indexOf(step);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-background border border-border w-full max-w-lg my-auto">

        {/* Header */}
        <div className="bg-secondary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={16} className="text-primary" />
            <div>
              <span className="text-white font-black uppercase text-lg leading-none block" style={bb()}>Purchase Plan</span>
              <span className="text-white/50 text-xs">{svc.code} – {svc.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
        </div>

        {/* Step bar — hide login label once logged in */}
        <div className="flex border-b border-border">
          {FLOW_STEPS.filter(s => loggedIn ? s !== "login" : true).map((s, i, arr) => {
            const label = STEP_LABELS[FLOW_STEPS.indexOf(s)];
            const cur = FLOW_STEPS.indexOf(step);
            const idx = FLOW_STEPS.indexOf(s);
            const done = cur > idx;
            const active = cur === idx;
            return (
              <div key={s} className={`flex-1 py-2.5 text-center text-[10px] font-black uppercase tracking-wider border-b-2 transition-colors ${active ? "border-primary text-primary" : done ? "border-green-500 text-green-600" : "border-transparent text-muted-foreground"}`}>
                {done ? "✓ " : `${i + 1}. `}{label}
              </div>
            );
          })}
        </div>

        <div className="p-6">

          {/* ── LOGIN GATE ─────────────────────────────────────────────────── */}
          {step === "login" && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Lock size={22} className="text-primary" />
                </div>
                <h3 className="font-black uppercase text-xl mb-1" style={bb()}>Sign In to Continue</h3>
                <p className="text-sm text-muted-foreground">You need to be logged in to purchase a plan. Your plan will be linked to your student account.</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-4 space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Selected Plan Preview</div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Course</span><span className="font-semibold">{svc.code} – {svc.label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Best Value Plan</span><span className="font-black text-primary" style={bb()}>R{svc.bundles[1]?.price.toLocaleString()}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="your@email.com"
                  className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••"
                    className="w-full bg-input-background border border-border px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <RedBtn className="w-full flex items-center justify-center gap-2"
                onClick={() => { setLoggedIn(true); setStep("plan"); }}>
                <LogIn size={14} /> Sign In & Continue
              </RedBtn>
              <p className="text-center text-xs text-muted-foreground">
                No account?{" "}
                <button onClick={onClose} className="text-primary font-semibold hover:underline">Register first</button>
                {" "}— it&apos;s free.
              </p>
            </div>
          )}

          {/* ── PLAN SELECTION ─────────────────────────────────────────────── */}
          {step === "plan" && (
            <div className="space-y-4">
              <h3 className="font-black uppercase text-xl" style={bb()}>Choose Your Plan</h3>
              <div className="space-y-3">
                {planOptions.map((opt) => {
                  const isSelected = selectedPlan.qty === opt.qty;
                  const optSaving = opt.qty > 1 ? (svc.perLesson * opt.qty) - opt.price : 0;
                  return (
                    <button key={opt.qty} onClick={() => setSelectedPlan(opt)}
                      className={`w-full flex items-center gap-4 p-4 border text-left transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground"}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{opt.label}</div>
                        {opt.qty > 1
                          ? <div className="text-xs text-muted-foreground">R{svc.perLesson}/lesson × {opt.qty}</div>
                          : <div className="text-xs text-muted-foreground">Pay-as-you-go, no commitment</div>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-lg" style={bb()}>R{opt.price.toLocaleString()}</div>
                        {optSaving > 0 && <div className="text-[10px] text-green-600 font-bold">Save R{optSaving}</div>}
                        {opt.qty === planOptions[planOptions.length - 1].qty &&
                          <span className="text-[10px] bg-primary text-white font-bold px-1.5 py-0.5">BEST VALUE</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {saving > 0 && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 text-green-800 text-xs font-semibold">
                  <CheckCircle size={13} /> You save R{saving} vs paying per lesson.
                </div>
              )}
              <RedBtn className="w-full" onClick={() => setStep("addons")}>Next: Add-ons <ArrowRight size={14} className="inline ml-1" /></RedBtn>
            </div>
          )}

          {/* ── ADD-ONS ────────────────────────────────────────────────────── */}
          {step === "addons" && (
            <div className="space-y-4">
              <h3 className="font-black uppercase text-xl" style={bb()}>Optional Add-ons</h3>
              {[
                { label: "Transport to/from Every Lesson", sub: `Pickup & dropoff · R${svc.transport} × ${selectedPlan.qty} lesson${selectedPlan.qty > 1 ? "s" : ""}`, cost: withTransport ? transportCost : svc.transport * selectedPlan.qty, checked: withTransport, toggle: () => setWithTransport(!withTransport) },
                { label: `${svc.hire.label} for K53 Test Day`, sub: `Fully insured ${svc.code} vehicle on test day`, cost: svc.hire.price, checked: withHire, toggle: () => setWithHire(!withHire) },
              ].map((item) => (
                <button key={item.label} onClick={item.toggle}
                  className={`w-full flex items-start gap-3 p-4 border transition-colors text-left ${item.checked ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                  <div className={`w-5 h-5 border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${item.checked ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {item.checked && <CheckCircle size={11} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.sub}</div>
                  </div>
                  <span className="text-sm font-black shrink-0" style={bb()}>+R{item.cost.toLocaleString()}</span>
                </button>
              ))}
              <div className="bg-card border border-border p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Plan Summary</div>
                <div className="flex justify-between text-sm"><span>{selectedPlan.label} · {svc.code}</span><span className="font-semibold">R{selectedPlan.price.toLocaleString()}</span></div>
                {withTransport && <div className="flex justify-between text-sm text-muted-foreground"><span>Transport</span><span>+R{transportCost}</span></div>}
                {withHire && <div className="flex justify-between text-sm text-muted-foreground"><span>{svc.hire.label}</span><span>+R{svc.hire.price}</span></div>}
                <div className="border-t border-border pt-2 flex justify-between font-black text-xl" style={bb()}>
                  <span>Total</span><span className="text-primary">R{total.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <OutlineBtn onClick={() => setStep("plan")} className="flex-1">Back</OutlineBtn>
                <RedBtn onClick={() => setStep("proof")} className="flex-1">Next: Upload Proof</RedBtn>
              </div>
            </div>
          )}

          {/* ── PROOF OF PAYMENT ───────────────────────────────────────────── */}
          {step === "proof" && (
            <div className="space-y-4">
              <h3 className="font-black uppercase text-xl" style={bb()}>Upload Proof of Payment</h3>

              {/* Banking details */}
              <div className="bg-secondary text-white p-4 space-y-2">
                <div className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">Banking Details — EFT to:</div>
                {[
                  { label: "Account Name", value: "Nthlakusani & Jama Holdings" },
                  { label: "Bank", value: "First National Bank (FNB)" },
                  { label: "Account No.", value: "62xxxxxxxx12" },
                  { label: "Branch Code", value: "250655" },
                  { label: "Reference", value: `${svc.code.replace(" ", "")}-LERATO` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-white/50">{r.label}</span>
                    <span className="font-bold text-white">{r.value}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-white/50 text-sm">Amount</span>
                  <span className="font-black text-primary text-xl" style={bb()}>R{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                className={`border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : proofFile ? "border-green-500 bg-green-50" : "border-border hover:border-muted-foreground"}`}
                onClick={() => document.getElementById("proof-input")?.click()}
              >
                <input id="proof-input" type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                {proofFile ? (
                  <div className="space-y-2">
                    {proofPreview
                      ? <img src={proofPreview} alt="Proof preview" className="max-h-32 mx-auto object-contain" />
                      : <FileText size={32} className="mx-auto text-green-600" />}
                    <p className="text-sm font-semibold text-green-700">{proofFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(proofFile.size / 1024).toFixed(1)} KB · Click to replace</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={28} className="mx-auto text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground">Accepted: JPG, PNG, PDF · Max 5 MB</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
                <AlertCircle size={13} className="text-primary shrink-0 mt-0.5" />
                Your plan will be activated only after the admin verifies and approves your proof of payment. You will be notified by email within 1 business day.
              </div>

              <div className="flex gap-3">
                <OutlineBtn onClick={() => setStep("addons")} className="flex-1">Back</OutlineBtn>
                <button
                  disabled={!proofFile}
                  onClick={() => {
                    const addons: string[] = [];
                    if (withTransport) addons.push(`Transport (R${transportCost})`);
                    if (withHire) addons.push(`${svc.hire.label} (R${svc.hire.price})`);
                    onAddPending({
                      id: `PAY-${Date.now()}`,
                      studentName: "Lerato Moloi",
                      studentEmail: loginEmail || "lerato.m@email.com",
                      courseCode: svc.code,
                      courseLabel: svc.label,
                      planLabel: selectedPlan.label,
                      planPrice: selectedPlan.price,
                      addons,
                      total,
                      proofFilename: proofFile!.name,
                      submittedAt: new Date().toLocaleString("en-ZA"),
                      status: "pending",
                    });
                    setStep("submitted");
                  }}
                  className={`flex-1 py-3 font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${proofFile ? "bg-primary text-white hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  style={bb()}
                >
                  <Upload size={14} /> Submit for Approval
                </button>
              </div>
            </div>
          )}

          {/* ── SUBMITTED ──────────────────────────────────────────────────── */}
          {step === "submitted" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList size={26} className="text-yellow-600" />
              </div>
              <h3 className="font-black uppercase text-xl" style={bb()}>Proof Submitted!</h3>
              <p className="text-sm text-muted-foreground">Your proof of payment has been sent to the admin for review. Your plan will be activated once approved.</p>

              <div className="bg-card border border-border p-4 text-left space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Submission Summary</div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{selectedPlan.label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Course</span><span className="font-semibold">{svc.code} – {svc.label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-black text-primary" style={bb()}>R{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">File</span><span className="text-xs truncate max-w-[180px]">{proofFile?.name}</span></div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 uppercase tracking-wider">Pending Admin Approval</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">You will receive an email confirmation once your plan is approved. Check your Student Portal for updates.</p>
              <RedBtn className="w-full" onClick={onClose}>Close</RedBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Registration Modal ───────────────────────────────────────────────────────

function RegisterModal({ onClose, onLoginSwitch }: { onClose: () => void; onLoginSwitch: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [show, setShow] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-background border border-border w-full max-w-md">
        <div className="bg-secondary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            <span className="text-white font-black uppercase text-lg" style={bb()}>Create Account</span>
          </div>
          <button onClick={onClose}><X size={20} className="text-white/60 hover:text-white" /></button>
        </div>

        {/* Step pills */}
        <div className="flex gap-2 px-6 pt-5">
          {["Personal Info", "Contact", "Set Password"].map((l, i) => (
            <div key={l} className="flex-1 text-center">
              <div className={`h-1 rounded-full mb-1 transition-colors ${step > i ? "bg-primary" : "bg-muted"}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</span>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <h3 className="font-black uppercase text-xl" style={bb()}>Personal Information</h3>
              {[
                { label: "First Name", type: "text", placeholder: "First name" },
                { label: "Last Name", type: "text", placeholder: "Last name" },
                { label: "ID Number / Passport", type: "text", placeholder: "SA ID or Passport number" },
                { label: "Date of Birth", type: "date", placeholder: "" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              ))}
              <RedBtn className="w-full" onClick={() => setStep(2)}>Continue</RedBtn>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-black uppercase text-xl" style={bb()}>Contact Details</h3>
              {[
                { label: "Email Address", type: "email", placeholder: "your@email.com" },
                { label: "Phone Number", type: "tel", placeholder: "0xx xxx xxxx" },
                { label: "Residential Address", type: "text", placeholder: "Street address" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Course of Interest</label>
                <select className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Select course…</option>
                  <option>Learners License</option>
                  <option>Code 8 – Light Motor Vehicle</option>
                  <option>Code 10 – Heavy Motor Vehicle</option>
                  <option>Code 14 – Extra Heavy</option>
                  <option>Code 1 – Motorcycle</option>
                </select>
              </div>
              <div className="flex gap-3">
                <OutlineBtn onClick={() => setStep(1)} className="flex-1">Back</OutlineBtn>
                <RedBtn className="flex-1" onClick={() => setStep(3)}>Continue</RedBtn>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="font-black uppercase text-xl" style={bb()}>Set Your Password</h3>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} placeholder="Min. 8 characters" className="w-full bg-input-background border border-border px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Confirm Password</label>
                <input type="password" placeholder="Repeat password" className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1 bg-muted/40 p-3">
                {["At least 8 characters", "One uppercase letter", "One number or symbol"].map((r) => (
                  <div key={r} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={11} className="text-primary" />{r}</div>
                ))}
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5" />
                <span className="text-xs text-muted-foreground">I agree to the <span className="text-primary underline">Terms of Service</span> and <span className="text-primary underline">Privacy Policy</span></span>
              </label>
              <div className="flex gap-3">
                <OutlineBtn onClick={() => setStep(2)} className="flex-1">Back</OutlineBtn>
                <RedBtn className="flex-1" onClick={onClose}>Create Account</RedBtn>
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already registered?{" "}
            <button onClick={onLoginSwitch} className="text-primary font-semibold hover:underline">Sign in here</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────

function LoginModal({ role, onClose, onSuccess, onRegister }: {
  role: Portal; onClose: () => void; onSuccess: (r: Portal) => void; onRegister: () => void;
}) {
  const [show, setShow] = useState(false);
  const labels: Record<NonNullable<Portal>, string> = { student: "Student Login", instructor: "Instructor Login", admin: "Administrator Login" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-background border border-border w-full max-w-sm">
        <div className="bg-secondary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-primary" />
            <span className="text-white font-black uppercase text-lg" style={bb()}>{role ? labels[role] : "Login"}</span>
          </div>
          <button onClick={onClose}><X size={20} className="text-white/60 hover:text-white" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label>
            <input type="email" placeholder="your@email.com" className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="••••••••" className="w-full bg-input-background border border-border px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="text-xs text-primary hover:underline">Forgot password?</button>
          </div>
          <button onClick={() => onSuccess(role)} className="w-full py-3 bg-primary text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={bb()}>
            <LogIn size={15} /> Sign In
          </button>
          {role === "student" && (
            <p className="text-center text-xs text-muted-foreground">
              New student?{" "}
              <button onClick={onRegister} className="text-primary font-semibold hover:underline">Create an account</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Practice Quiz ────────────────────────────────────────────────────────────

function PracticeQuiz({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const isCorrect = selected === q.answer;

  const handleSelect = (i: number) => {
    if (submitted) return;
    setSelected(i);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    if (current + 1 < QUIZ_QUESTIONS.length) {
      setCurrent(current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const score = answers.filter((a, i) => a === QUIZ_QUESTIONS[i].answer).length;
  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  if (finished) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className={`p-8 text-center border-2 ${pct >= 75 ? "border-green-500 bg-green-50" : "border-primary bg-primary/5"}`}>
          <div className="text-6xl font-black mb-2" style={bb()}>{pct}%</div>
          <div className="text-xl font-black uppercase mb-1" style={bb()}>{pct >= 75 ? "Well Done!" : "Keep Practising"}</div>
          <div className="text-sm text-muted-foreground">{score} of {QUIZ_QUESTIONS.length} correct</div>
          {pct >= 75
            ? <p className="text-sm text-green-800 mt-3">You are on track for the K53 theory test. Keep it up!</p>
            : <p className="text-sm text-muted-foreground mt-3">Review the K53 Road Signs Guide and try again.</p>
          }
        </div>
        <div className="space-y-2">
          {QUIZ_QUESTIONS.map((q, i) => {
            const correct = answers[i] === q.answer;
            return (
              <div key={i} className={`p-3 border flex items-start gap-2 ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                {correct ? <CheckCircle size={15} className="text-green-600 mt-0.5 shrink-0" /> : <XCircle size={15} className="text-primary mt-0.5 shrink-0" />}
                <div>
                  <div className="text-xs font-semibold text-foreground">{q.q}</div>
                  <div className="text-xs text-muted-foreground">Correct: <span className="font-bold">{q.options[q.answer]}</span></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <OutlineBtn onClick={onBack} className="flex-1">Back to Resources</OutlineBtn>
          <RedBtn className="flex-1" onClick={() => { setCurrent(0); setSelected(null); setAnswers(Array(QUIZ_QUESTIONS.length).fill(null)); setSubmitted(false); setFinished(false); }}>Retry Quiz</RedBtn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft size={14} /> Resources</button>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Question {current + 1} of {QUIZ_QUESTIONS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted">
        <div className="h-1.5 bg-primary transition-all" style={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>

      <div className="bg-card border border-border p-6">
        <div className="flex items-start gap-2 mb-5">
          <HelpCircle size={18} className="text-primary shrink-0 mt-0.5" />
          <h3 className="text-base font-semibold leading-snug">{q.q}</h3>
        </div>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let state = "default";
            if (submitted) {
              if (i === q.answer) state = "correct";
              else if (i === selected) state = "wrong";
            } else if (selected === i) state = "selected";

            const cls = {
              default: "border-border hover:border-muted-foreground cursor-pointer",
              selected: "border-primary bg-primary/5 cursor-pointer",
              correct: "border-green-500 bg-green-50",
              wrong: "border-primary bg-primary/10",
            }[state];

            return (
              <button key={i} onClick={() => handleSelect(i)} className={`w-full flex items-center gap-3 p-3.5 border text-left transition-colors ${cls}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-black ${state === "selected" || state === "correct" ? "border-primary" : state === "wrong" ? "border-primary" : "border-muted-foreground"}`} style={bb()}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm font-medium">{opt}</span>
                {submitted && i === q.answer && <CheckCircle size={15} className="ml-auto text-green-600" />}
                {submitted && i === selected && i !== q.answer && <XCircle size={15} className="ml-auto text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {submitted && (
        <div className={`p-3 border ${isCorrect ? "border-green-300 bg-green-50 text-green-800" : "border-primary/30 bg-primary/5 text-primary"} text-sm font-semibold`}>
          {isCorrect ? "✓ Correct! Well done." : `✗ The correct answer is: ${q.options[q.answer]}`}
        </div>
      )}

      <div className="flex gap-3">
        {!submitted && selected !== null && (
          <RedBtn className="flex-1" onClick={() => setSubmitted(true)}>Check Answer</RedBtn>
        )}
        {submitted && (
          <RedBtn className="flex-1" onClick={handleNext}>
            {current + 1 < QUIZ_QUESTIONS.length ? "Next Question" : "View Results"}
          </RedBtn>
        )}
      </div>
    </div>
  );
}

// ─── Calendar Booking ─────────────────────────────────────────────────────────

function CalendarBooking({ onPayment }: { onPayment: () => void }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = [23, 24, 25, 26, 27, 28];
  const times = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
  const booked = new Set(["23-09:00", "24-11:00", "25-08:00", "26-13:00", "27-10:00"]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("Code 8 – Light Motor Vehicle");
  const [selectedInstructor, setSelectedInstructor] = useState("No Preference");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-black uppercase" style={bb()}>Book a Lesson</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Course Type</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {["Code 8 – Light Motor Vehicle", "Code 10 – Heavy Motor Vehicle", "Code 14 – Extra Heavy", "Code 1 – Motorcycle"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Instructor</label>
          <select value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            {["No Preference", "TR Mafetsa", "NB Jama"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card border border-border overflow-auto">
        <div className="text-center py-3 border-b border-border font-black uppercase text-base" style={bb()}>
          Week of 23–28 June 2026
        </div>

        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-border">
          <div className="py-2 px-3 text-xs text-muted-foreground font-semibold border-r border-border">Time</div>
          {days.map((d, i) => (
            <div key={d} className="py-2 px-2 text-center border-r last:border-r-0 border-border">
              <div className="text-xs font-bold uppercase text-muted-foreground">{d}</div>
              <div className="text-sm font-black" style={bb()}>{dates[i]}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {times.map((t) => (
          <div key={t} className="grid grid-cols-7 border-b last:border-b-0 border-border">
            <div className="py-2.5 px-3 text-xs text-muted-foreground font-semibold border-r border-border">{t}</div>
            {dates.map((d) => {
              const key = `${d}-${t}`;
              const isBooked = booked.has(key);
              const isSelected = selectedSlot === key;
              return (
                <button
                  key={key}
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(key)}
                  className={`py-2.5 px-1 border-r last:border-r-0 border-border text-[10px] font-bold uppercase transition-colors ${isBooked ? "bg-muted text-muted-foreground cursor-not-allowed" : isSelected ? "bg-primary text-white" : "hover:bg-primary/10 hover:text-primary"}`}
                >
                  {isBooked ? "Taken" : isSelected ? "Selected" : "Open"}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedSlot && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 border border-primary/20 p-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Selected Slot</div>
            <div className="font-black text-lg text-foreground" style={bb()}>
              {days[dates.indexOf(parseInt(selectedSlot.split("-")[0]))]} {selectedSlot.split("-")[0]} Jun · {selectedSlot.split("-")[1]}
            </div>
            <div className="text-xs text-muted-foreground">{selectedCourse} · {selectedInstructor}</div>
          </div>
          <RedBtn onClick={onPayment} className="shrink-0 flex items-center gap-2">
            <CreditCard size={15} /> Purchase Plan
          </RedBtn>
        </div>
      )}
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ onClose, onAddPending }: { onClose: () => void; onAddPending: (p: PendingPayment) => void }) {
  const [tab, setTab] = useState<"overview" | "book" | "progress" | "resources" | "messages">("overview");
  const [quizActive, setQuizActive] = useState(false);
  const [purchaseService, setPurchaseService] = useState<typeof SERVICES[0] | null>(null);
  const [msg, setMsg] = useState("");
  const [chatMsgs, setChatMsgs] = useState(MESSAGES);

  const sendMsg = () => {
    if (!msg.trim()) return;
    setChatMsgs([...chatMsgs, { from: "Me", role: "Student", time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }), text: msg, mine: true }]);
    setMsg("");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "book", label: "Schedule", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "resources", label: "Study", icon: BookOpen },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {purchaseService && (
        <PurchasePlanModal service={purchaseService} onClose={() => setPurchaseService(null)}
          isLoggedIn={true} onAddPending={onAddPending} />
      )}

      <header className="bg-secondary text-secondary-foreground flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-base font-black uppercase text-white" style={bb()}>Student Portal</div>
          <span className="text-[10px] bg-primary text-white px-2 py-0.5 font-bold uppercase tracking-wider hidden sm:block">Since 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTab("messages")} className="relative text-white/70 hover:text-white">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full text-[9px] font-black text-white flex items-center justify-center">1</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs" style={bb()}>LM</div>
            <span className="text-sm text-white hidden sm:block">Lerato Moloi</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white ml-1"><X size={18} /></button>
        </div>
      </header>

      <div className="border-b border-border bg-card flex overflow-x-auto shrink-0">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setQuizActive(false); }} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap uppercase tracking-wider ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-5 sm:p-6">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl font-black uppercase" style={bb()}>Welcome back, Lerato</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Lessons Done", value: "7", sub: "of 10 booked" },
                { label: "Hours Driven", value: "10.5h", sub: "this month" },
                { label: "Theory Score", value: "84%", sub: "last attempt" },
                { label: "Test Readiness", value: "72%", sub: "estimated" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border p-4">
                  <div className="text-3xl font-black text-primary" style={bb()}>{s.value}</div>
                  <div className="text-xs font-semibold mt-1">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-card border border-border p-5">
                <h3 className="font-black uppercase text-lg mb-4" style={bb()}>Upcoming Lessons</h3>
                {[
                  { date: "Fri 27 Jun", time: "09:00", inst: "TR Mafetsa", type: "Code 8 · Lesson 8" },
                  { date: "Mon 30 Jun", time: "11:00", inst: "NB Jama", type: "Code 8 · Lesson 9" },
                ].map((l) => (
                  <div key={l.date} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 mb-3">
                    <div className="bg-primary text-white text-[10px] font-black px-2 py-1 min-w-[46px] text-center leading-tight" style={bb()}>
                      {l.date.split(" ")[0]}<br />{l.date.split(" ").slice(1).join(" ")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{l.type}</div>
                      <div className="text-xs text-muted-foreground">{l.time} · {l.inst}</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setTab("book")} className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1"><Calendar size={12} /> Book another lesson</button>
              </div>

              <div className="bg-card border border-border p-5">
                <h3 className="font-black uppercase text-lg mb-4" style={bb()}>Account Balance</h3>
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1">Remaining Credit</div>
                  <div className="text-3xl font-black" style={bb()}>R660 <span className="text-base font-normal text-muted-foreground">left</span></div>
                </div>
                <div className="space-y-1 mb-4">
                  {[{ label: "10 Lessons (Code 8)", amount: "R2,200", date: "01 Jun 2026" }, { label: "Transport ×3", amount: "R600", date: "01 Jun 2026" }].map(t => (
                    <div key={t.label} className="flex justify-between text-xs text-muted-foreground border-b border-border pb-1">
                      <span>{t.label} <span className="text-[10px]">({t.date})</span></span>
                      <span className="font-bold text-foreground">{t.amount}</span>
                    </div>
                  ))}
                </div>
                <RedBtn className="w-full" onClick={() => setPurchaseService(SERVICES[0])}>Purchase a Plan</RedBtn>
              </div>
            </div>
          </div>
        )}

        {/* BOOK */}
        {tab === "book" && <CalendarBooking onPayment={() => setPurchaseService(SERVICES[0])} />}

        {/* PROGRESS */}
        {tab === "progress" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-black uppercase" style={bb()}>My Progress</h2>
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-70">Overall Test Readiness</div>
                <div className="text-4xl font-black" style={bb()}>72%</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">Estimated Ready</div>
                <div className="text-sm font-bold">After Lesson 9</div>
              </div>
            </div>
            {[
              { skill: "Vehicle Control & Parking", progress: 90, status: "Excellent" },
              { skill: "Road Sign Recognition", progress: 84, status: "Good" },
              { skill: "Traffic Observations", progress: 75, status: "Good" },
              { skill: "Emergency Procedures", progress: 70, status: "Developing" },
              { skill: "Highway / Freeway Driving", progress: 60, status: "Developing" },
              { skill: "Pre-Drive Inspection", progress: 95, status: "Excellent" },
            ].map((item) => (
              <div key={item.skill} className="bg-card border border-border p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">{item.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 ${item.status === "Excellent" ? "bg-green-100 text-green-800" : item.status === "Good" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{item.status}</span>
                    <span className="text-base font-black text-primary" style={bb()}>{item.progress}%</span>
                  </div>
                </div>
                <div className="h-2 bg-muted">
                  <div className="h-2 bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}

            <div className="bg-card border border-border p-4">
              <h3 className="font-black uppercase mb-3" style={bb()}>Instructor Notes</h3>
              {[
                { date: "20 Jun", note: "Good control during parallel parking. Need to improve shoulder checks when changing lanes." },
                { date: "17 Jun", note: "Excellent pre-trip inspection. Freeway speed management improving." },
              ].map(n => (
                <div key={n.date} className="flex gap-3 pb-3 border-b border-border last:border-0 mb-3">
                  <span className="text-[10px] font-bold text-primary shrink-0 bg-primary/10 px-2 py-1 h-fit">{n.date}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {tab === "resources" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {quizActive ? <PracticeQuiz onBack={() => setQuizActive(false)} /> : (
              <>
                <h2 className="text-3xl font-black uppercase" style={bb()}>Study Materials</h2>
                <div className="bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
                  <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs">Your K53 theory test is based on the official South African road code. Use the materials below to prepare thoroughly before your test date.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: "K53 Road Signs Guide", type: "PDF", size: "2.4 MB", tag: "Theory", icon: FileText },
                    { title: "Rules of the Road – Full Guide", type: "PDF", size: "5.1 MB", tag: "Theory", icon: FileText },
                    { title: "Pre-Drive Inspection Checklist", type: "PDF", size: "0.8 MB", tag: "Practical", icon: FileText },
                    { title: "K53 Manoeuvres Guide", type: "PDF", size: "1.2 MB", tag: "Practical", icon: FileText },
                  ].map((r) => (
                    <div key={r.title} className="bg-card border border-border p-4 flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <r.icon size={18} className="text-primary shrink-0" />
                        <div>
                          <div className="text-sm font-semibold group-hover:text-primary transition-colors">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.type} · {r.size}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5">{r.tag}</span>
                        <Download size={14} className="text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-black uppercase text-lg mb-3" style={bb()}>Practice Tests</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { title: "Practice Quiz — Road Signs & Rules", q: "8 questions", tag: "Start Now" },
                      { title: "Mock Theory Test (50 Questions)", q: "50 questions · 1 hour", tag: "Coming Soon" },
                    ].map((q) => (
                      <div key={q.title} className="bg-card border border-border p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{q.title}</div>
                          <div className="text-xs text-muted-foreground">{q.q}</div>
                        </div>
                        {q.tag === "Start Now"
                          ? <RedBtn onClick={() => setQuizActive(true)} className="text-xs px-3 py-2 shrink-0">Start</RedBtn>
                          : <span className="text-xs font-bold text-muted-foreground border border-border px-2 py-1 shrink-0">Soon</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="max-w-2xl mx-auto flex flex-col h-full" style={{ minHeight: "calc(100vh - 180px)" }}>
            <h2 className="text-3xl font-black uppercase mb-4" style={bb()}>Messages</h2>
            <div className="bg-card border border-border flex flex-col flex-1">
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary flex items-center justify-center text-white font-black text-xs" style={bb()}>NJ</div>
                <div>
                  <div className="text-sm font-semibold">NB Jama</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online</div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3" style={{ minHeight: 200 }}>
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2.5 text-sm leading-relaxed ${m.mine ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                      {!m.mine && <div className="text-[10px] font-bold mb-1 opacity-70">{m.from}</div>}
                      {m.text}
                      <div className={`text-[10px] mt-1 ${m.mine ? "text-white/60" : "text-muted-foreground"}`}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-3 flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message…" className="flex-1 bg-input-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={sendMsg} className="bg-primary text-white px-3 py-2 hover:opacity-90 transition-opacity"><Send size={15} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Instructor Dashboard ─────────────────────────────────────────────────────

function InstructorDashboard({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"schedule" | "students" | "messages">("schedule");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [progNote, setProgNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    { from: "Lerato Moloi", mine: false, time: "09:20", text: "Good morning! Will we cover highway driving today?" },
    { from: "Me", mine: true, time: "09:22", text: "Yes, we will do the N1 approach and merge practice." },
  ]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    setChatMsgs([...chatMsgs, { from: "Me", mine: true, time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }), text: msg }]);
    setMsg("");
  };

  const students = [
    { name: "Bongani Nkosi", code: "Code 8", lesson: 3, progress: 55 },
    { name: "Zanele Dube", code: "Code 8", lesson: 6, progress: 70 },
    { name: "Siphamandla Zulu", code: "Code 14", lesson: 2, progress: 30 },
    { name: "Ayanda Mthembu", code: "Code 1", lesson: 4, progress: 60 },
    { name: "Lerato Moloi", code: "Code 8", lesson: 7, progress: 72 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      <header className="bg-secondary flex items-center justify-between px-5 py-3 shrink-0">
        <div className="text-base font-black uppercase text-white" style={bb()}>Instructor Portal</div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs" style={bb()}>TM</div>
          <span className="text-sm text-white hidden sm:block">TR Mafetsa</span>
          <button onClick={onClose} className="text-white/60 hover:text-white ml-1"><X size={18} /></button>
        </div>
      </header>

      <div className="border-b border-border bg-card flex shrink-0">
        {[
          { id: "schedule", label: "Schedule", icon: Calendar },
          { id: "students", label: "My Students", icon: Users },
          { id: "messages", label: "Messages", icon: MessageSquare },
        ].map((t: { id: string; label: string; icon: React.ElementType }) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as "schedule" | "students" | "messages")} className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-5 sm:p-6">
        {tab === "schedule" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase" style={bb()}>Monday 23 June 2026</h2>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: "Today", value: "4" }, { label: "This Week", value: "18" }, { label: "Students", value: "24" }].map(s => (
                  <div key={s.label} className="bg-card border border-border px-4 py-2 text-center">
                    <div className="text-2xl font-black text-primary" style={bb()}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border">
              <div className="px-5 py-3 border-b border-border font-black uppercase text-sm" style={bb()}>Today's Bookings</div>
              {[
                { time: "08:00", student: "Bongani Nkosi", course: "Code 8", lesson: 3, status: "Confirmed", location: "Sandton Dept. of Transport" },
                { time: "10:00", student: "Zanele Dube", course: "Code 8", lesson: 6, status: "Confirmed", location: "Randburg Testing Ground" },
                { time: "12:00", student: "Siphamandla Zulu", course: "Code 14", lesson: 2, status: "Pending", location: "Johannesburg Truck Test Centre" },
                { time: "14:30", student: "Ayanda Mthembu", course: "Code 1", lesson: 4, status: "Confirmed", location: "Roodepoort Motorcycle Centre" },
              ].map((b) => (
                <div key={b.time} className="px-5 py-3.5 border-b last:border-0 border-border flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="text-base font-black text-primary w-16 shrink-0" style={bb()}>{b.time}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{b.student}</div>
                    <div className="text-xs text-muted-foreground">{b.course} · Lesson {b.lesson} · {b.location}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 shrink-0 ${b.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{b.status}</span>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setSelectedStudent(b.student); setTab("students"); }} className="text-xs text-primary font-semibold hover:underline">Update Progress</button>
                    <button onClick={() => setTab("messages")} className="text-xs text-muted-foreground hover:text-foreground font-semibold">Message</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "students" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <h2 className="text-3xl font-black uppercase" style={bb()}>My Students</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {students.map((s) => (
                <div key={s.name} className={`bg-card border p-5 transition-colors ${selectedStudent === s.name ? "border-primary" : "border-border"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.code} · Lesson {s.lesson}</div>
                    </div>
                    <button onClick={() => setSelectedStudent(selectedStudent === s.name ? null : s.name)} className="text-xs text-primary font-bold hover:underline">{selectedStudent === s.name ? "Hide" : "Update"}</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted">
                      <div className="h-1.5 bg-primary transition-all" style={{ width: `${s.progress}%` }} />
                    </div>
                    <span className="text-xs font-black text-primary" style={bb()}>{s.progress}%</span>
                  </div>

                  {selectedStudent === s.name && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progress Note</div>
                      <textarea rows={3} value={progNote} onChange={e => { setProgNote(e.target.value); setSaved(false); }} placeholder="Describe today's lesson outcomes…" className="w-full bg-input-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                      <div className="flex gap-2">
                        {["Excellent", "Good", "Developing", "Needs Work"].map(tag => (
                          <button key={tag} onClick={() => setProgNote(prev => prev + (prev ? ". " : "") + tag + ".")} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 font-bold hover:bg-primary hover:text-white transition-colors">{tag}</button>
                        ))}
                      </div>
                      <button onClick={() => setSaved(true)} className="w-full py-2 bg-primary text-white text-xs font-black uppercase tracking-widest hover:opacity-90">
                        {saved ? "✓ Saved" : "Save Progress Log"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black uppercase" style={bb()}>Messages</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {students.map(s => (
                <button key={s.name} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center font-black text-xs" style={bb()}>{s.name.split(" ").map(n => n[0]).join("")}</div>
                  <span className="text-[10px] text-muted-foreground">{s.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            <div className="bg-card border border-border flex flex-col" style={{ height: 420 }}>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary flex items-center justify-center text-white font-black text-xs" style={bb()}>LM</div>
                <div>
                  <div className="text-sm font-semibold">Lerato Moloi</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online · Code 8 Student</div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2.5 text-sm leading-relaxed ${m.mine ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                      {!m.mine && <div className="text-[10px] font-bold mb-1 opacity-70">{m.from}</div>}
                      {m.text}
                      <div className={`text-[10px] mt-1 ${m.mine ? "text-white/60" : "text-muted-foreground"}`}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-3 flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Send a reminder or note…" className="flex-1 bg-input-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={sendMsg} className="bg-primary text-white px-3 py-2 hover:opacity-90"><Send size={15} /></button>
              </div>
            </div>

            {/* Quick reminder templates */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Reminders</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Your lesson is tomorrow at 09:00. Please be on time.",
                  "Reminder: bring your ID for the test day.",
                  "Well done in today's lesson! Keep practising mirror checks.",
                ].map(tmpl => (
                  <button key={tmpl} onClick={() => setMsg(tmpl)} className="text-xs border border-border px-3 py-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-left">
                    {tmpl.length > 45 ? tmpl.slice(0, 45) + "…" : tmpl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ onClose, pendingPayments, onUpdatePayment }: {
  onClose: () => void;
  pendingPayments: PendingPayment[];
  onUpdatePayment: (id: string, status: PaymentStatus, note: string) => void;
}) {
  const [tab, setTab] = useState<"overview" | "courses" | "instructors" | "inquiries" | "reports" | "payments">("overview");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const pendingCount = pendingPayments.filter(p => p.status === "pending").length;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      <header className="bg-secondary flex items-center justify-between px-5 py-3 shrink-0">
        <div className="text-base font-black uppercase text-white" style={bb()}>Admin Portal</div>
        <div className="flex items-center gap-3">
          <Settings size={17} className="text-white/60 hover:text-white cursor-pointer" />
          <button onClick={() => setTab("payments")} className="relative text-white/60 hover:text-white cursor-pointer">
            <Bell size={17} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] font-black text-white flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
          <div className="w-7 h-7 bg-primary flex items-center justify-center text-white font-black text-xs" style={bb()}>AD</div>
          <button onClick={onClose} className="text-white/60 hover:text-white ml-1"><X size={18} /></button>
        </div>
      </header>

      <div className="border-b border-border bg-card flex overflow-x-auto shrink-0">
        {[
          { id: "overview", label: "Overview", icon: BarChart2 },
          { id: "payments", label: "Payments", icon: CreditCard, badge: pendingCount },
          { id: "courses", label: "Courses", icon: BookOpen },
          { id: "instructors", label: "Instructors", icon: Users },
          { id: "inquiries", label: "Inquiries", icon: MessageSquare },
          { id: "reports", label: "Reports", icon: FileText },
        ].map((t: { id: string; label: string; icon: React.ElementType; badge?: number }) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id as "overview" | "courses" | "instructors" | "inquiries" | "reports" | "payments")} className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider whitespace-nowrap ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon size={13} />{t.label}
              {t.badge && t.badge > 0 ? <span className="ml-0.5 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{t.badge}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-5 sm:p-6">
        {tab === "overview" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl font-black uppercase" style={bb()}>Business Overview — June 2026</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Active Students", value: "47", change: "+8 this month", up: true },
                { label: "Monthly Revenue", value: "R38,400", change: "+12% vs May", up: true },
                { label: "Lessons Delivered", value: "156", change: "this month", up: true },
                { label: "Open Inquiries", value: "5", change: "needs response", up: false },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border p-4">
                  <div className="text-2xl font-black text-primary" style={bb()}>{s.value}</div>
                  <div className="text-xs font-semibold mt-1">{s.label}</div>
                  <div className={`text-xs ${s.up ? "text-green-600" : "text-primary"}`}>{s.change}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Revenue by course */}
              <div className="bg-card border border-border p-5">
                <h3 className="font-black uppercase mb-4" style={bb()}>Revenue by Course — June</h3>
                {[
                  { code: "Code 8", revenue: 18700, pct: 49 },
                  { code: "Code 10", revenue: 10500, pct: 27 },
                  { code: "Code 14", revenue: 6400, pct: 17 },
                  { code: "Code 1", revenue: 2800, pct: 7 },
                ].map(r => (
                  <div key={r.code} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">{r.code}</span>
                      <span className="font-black text-primary" style={bb()}>R{r.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted">
                      <div className="h-2 bg-primary" style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="bg-card border border-border p-5 space-y-3">
                <h3 className="font-black uppercase mb-2" style={bb()}>Quick Actions</h3>
                {[
                  { label: "Add New Student", icon: UserPlus, action: () => setTab("inquiries") },
                  { label: "Assign Instructor to Student", icon: Users, action: () => setTab("instructors") },
                  { label: "Create New Course", icon: BookOpen, action: () => setTab("courses") },
                  { label: "Generate Monthly Report", icon: Download, action: () => setTab("reports") },
                  { label: "Print Schedule", icon: Printer, action: () => setTab("overview") },
                ].map(a => (
                  <button key={a.label} onClick={a.action} className="w-full flex items-center gap-3 px-4 py-2.5 border border-border hover:border-primary hover:text-primary text-sm font-semibold text-left transition-colors group">
                    <a.icon size={15} className="text-primary shrink-0" />
                    {a.label}
                    <ChevronRight size={13} className="ml-auto text-muted-foreground group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "courses" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase" style={bb()}>Course Management</h2>
              <RedBtn>+ New Course</RedBtn>
            </div>
            <div className="bg-card border border-border">
              <div className="grid grid-cols-5 px-5 py-2.5 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Code</span><span>Type</span><span>Price/Lesson</span><span>Active Students</span><span>Actions</span>
              </div>
              {[
                { code: "Learners", type: "Theory + Practical", price: "R950–R2,000", students: 12 },
                { code: "Code 8", type: "Light Motor Vehicle", price: "R220", students: 24 },
                { code: "Code 10", type: "Heavy Motor Vehicle", price: "R250", students: 7 },
                { code: "Code 14", type: "Extra Heavy", price: "R400", students: 3 },
                { code: "Code 1", type: "Motorcycle", price: "R200", students: 1 },
              ].map(c => (
                <div key={c.code} className="grid grid-cols-5 px-5 py-3.5 border-b last:border-0 border-border items-center text-sm">
                  <span className="font-black" style={bb()}>{c.code}</span>
                  <span className="text-muted-foreground text-xs">{c.type}</span>
                  <span className="font-semibold">{c.price}</span>
                  <span className="font-bold text-primary" style={bb()}>{c.students}</span>
                  <div className="flex gap-3">
                    <button className="text-xs text-primary font-semibold hover:underline">Edit</button>
                    <button className="text-xs text-muted-foreground hover:text-foreground font-semibold">Archive</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "instructors" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <h2 className="text-3xl font-black uppercase" style={bb()}>Instructor Management</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { name: "TR Mafetsa", phone: "061 580 6437", students: 24, today: 4, codes: ["Code 8", "Code 10"], status: "Active" },
                { name: "NB Jama", phone: "083 268 7425", students: 23, today: 3, codes: ["Code 8", "Code 14", "Code 1"], status: "Active" },
              ].map(inst => (
                <div key={inst.name} className="bg-card border border-border p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary flex items-center justify-center text-white font-black" style={bb()}>
                        {inst.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-black text-lg" style={bb()}>{inst.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{inst.phone}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-1">{inst.status}</span>
                  </div>
                  <div className="flex gap-3 mb-3">
                    {[{ label: "Students", value: inst.students }, { label: "Today", value: inst.today }].map(s => (
                      <div key={s.label} className="bg-background border border-border px-3 py-2 text-center flex-1">
                        <div className="text-xl font-black text-primary" style={bb()}>{s.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {inst.codes.map(c => <span key={c} className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5">{c}</span>)}
                  </div>
                  <div className="flex gap-2">
                    <OutlineBtn className="flex-1 text-xs py-1.5">Assign Student</OutlineBtn>
                    <OutlineBtn className="flex-1 text-xs py-1.5">View Schedule</OutlineBtn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "inquiries" && (
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="text-3xl font-black uppercase" style={bb()}>Contact Form Inquiries</h2>
            {[
              { name: "Mpho Sithole", topic: "Code 10 pricing & availability", email: "mpho.s@gmail.com", time: "2h ago", urgent: true, status: "Open" },
              { name: "Thandiwe Moyo", topic: "Transport availability for Code 8", email: "thandiwe.m@outlook.com", time: "4h ago", urgent: false, status: "Open" },
              { name: "Siyanda Ndlovu", topic: "Learners license package query", email: "siya.n@gmail.com", time: "6h ago", urgent: false, status: "Open" },
              { name: "Phindi Mthethwa", topic: "Code 14 truck hire query", email: "phindi.m@webmail.co.za", time: "1d ago", urgent: false, status: "Resolved" },
              { name: "Lebo Tau", topic: "Bundle discount for 2 students", email: "lebo.tau@gmail.com", time: "1d ago", urgent: false, status: "Resolved" },
            ].map(inq => (
              <div key={inq.name} className={`bg-card border p-5 ${inq.urgent ? "border-primary" : "border-border"}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {inq.urgent && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                    <div>
                      <div className="font-semibold">{inq.name}</div>
                      <div className="text-sm text-muted-foreground">{inq.topic}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Mail size={11} />{inq.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{inq.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 ${inq.status === "Open" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{inq.status}</span>
                  </div>
                </div>
                {inq.status === "Open" && (
                  <div className="mt-3 flex gap-2">
                    <RedBtn className="text-xs py-1.5 px-3">Respond</RedBtn>
                    <OutlineBtn className="text-xs py-1.5 px-3">Mark Resolved</OutlineBtn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase" style={bb()}>Financial Reports</h2>
              <div className="flex gap-2">
                <OutlineBtn className="flex items-center gap-2 text-xs py-2"><Printer size={13} /> Print</OutlineBtn>
                <RedBtn className="flex items-center gap-2 text-xs py-2"><Download size={13} /> Export PDF</RedBtn>
              </div>
            </div>

            <div className="bg-secondary text-white p-5">
              <div className="text-xs uppercase tracking-widest opacity-60 mb-1">June 2026 Total Revenue</div>
              <div className="text-5xl font-black" style={bb()}>R38,400</div>
              <div className="text-xs text-green-400 mt-1">▲ 12% vs May 2026 (R34,250)</div>
            </div>

            <div className="bg-card border border-border">
              <div className="px-5 py-3 border-b border-border font-black uppercase text-sm" style={bb()}>Revenue Breakdown</div>
              <div className="divide-y divide-border">
                {[
                  { item: "Code 8 Lessons (85 lessons)", amount: 18700 },
                  { item: "Code 10 Lessons (42 lessons)", amount: 10500 },
                  { item: "Code 14 Lessons (16 lessons)", amount: 6400 },
                  { item: "Code 1 Lessons (14 lessons)", amount: 2800 },
                  { item: "Transport Fees (collected)", amount: 3200 },
                  { item: "Vehicle Hire Fees", amount: 4100 },
                ].map(row => (
                  <div key={row.item} className="px-5 py-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.item}</span>
                    <span className="font-black" style={bb()}>R{row.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="px-5 py-3.5 flex justify-between font-black bg-primary/5 border-t-2 border-primary">
                  <span style={bb()} className="uppercase">Total</span>
                  <span className="text-primary text-xl" style={bb()}>R45,700</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENTS APPROVAL ───────────────────────────────────────── */}
        {tab === "payments" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase" style={bb()}>Payment Approvals</h2>
              <div className="flex gap-2 text-xs">
                <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-1">{pendingPayments.filter(p => p.status === "pending").length} Pending</span>
                <span className="bg-green-100 text-green-800 font-bold px-2 py-1">{pendingPayments.filter(p => p.status === "approved").length} Approved</span>
                <span className="bg-red-100 text-red-800 font-bold px-2 py-1">{pendingPayments.filter(p => p.status === "rejected").length} Rejected</span>
              </div>
            </div>

            {pendingPayments.length === 0 && (
              <div className="bg-card border border-border p-12 text-center">
                <ClipboardList size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No payment submissions yet. They will appear here when students upload proof of payment.</p>
              </div>
            )}

            {pendingPayments.map((p) => (
              <div key={p.id} className={`bg-card border-l-4 border border-border p-5 space-y-4 ${p.status === "pending" ? "border-l-yellow-500" : p.status === "approved" ? "border-l-green-500" : "border-l-primary"}`}>
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-lg" style={bb()}>{p.studentName}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 uppercase ${p.status === "pending" ? "bg-yellow-100 text-yellow-800" : p.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{p.studentEmail} · Submitted {p.submittedAt}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-primary" style={bb()}>R{p.total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{p.planLabel} · {p.courseCode}</div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Course", value: `${p.courseCode} – ${p.courseLabel}` },
                    { label: "Plan", value: p.planLabel },
                    { label: "Add-ons", value: p.addons.length ? p.addons.join(", ") : "None" },
                    { label: "Proof File", value: p.proofFilename },
                  ].map(d => (
                    <div key={d.label} className="bg-background border border-border px-3 py-2">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{d.label}</div>
                      <div className="text-xs font-semibold truncate">{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Proof file preview strip */}
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border border-border">
                  <FileText size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-semibold flex-1 truncate">{p.proofFilename}</span>
                  <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <Download size={11} /> Download Proof
                  </button>
                </div>

                {/* Review note & actions — only for pending */}
                {p.status === "pending" && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Review Note (optional)</label>
                      <input
                        type="text"
                        value={reviewNotes[p.id] ?? ""}
                        onChange={e => setReviewNotes(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="e.g. Payment confirmed via FNB reference #123456"
                        className="w-full bg-input-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onUpdatePayment(p.id, "approved", reviewNotes[p.id] ?? "")}
                        className="flex-1 py-2.5 bg-green-600 text-white text-sm font-black uppercase tracking-wider hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        style={bb()}
                      >
                        <ThumbsUp size={14} /> Approve Plan
                      </button>
                      <button
                        onClick={() => onUpdatePayment(p.id, "rejected", reviewNotes[p.id] ?? "")}
                        className="flex-1 py-2.5 border-2 border-primary text-primary text-sm font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                        style={bb()}
                      >
                        <ThumbsDown size={14} /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Resolved state */}
                {p.status !== "pending" && (
                  <div className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold border ${p.status === "approved" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-primary"}`}>
                    {p.status === "approved" ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                    {p.status === "approved" ? "Plan Activated" : "Plan Rejected"}
                    {p.reviewNote && <span className="font-normal text-xs ml-2 opacity-70">· {p.reviewNote}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<Portal>(null);
  const [loginRole, setLoginRole] = useState<Portal>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [promoBanner, setPromoBanner] = useState(true);
  const [purchaseService, setPurchaseService] = useState<typeof SERVICES[0] | null>(null);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const addPending = useCallback((p: PendingPayment) => setPendingPayments(prev => [p, ...prev]), []);

  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, section: NavSection) => {
    setMobileOpen(false);
    setActiveSection(section);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openLogin = (role: Portal) => { setLoginRole(role); setModal("login"); };
  const openRegister = () => { setLoginRole(null); setModal("register"); };

  const handleLoginSuccess = (role: Portal) => {
    setModal(null);
    setLoginRole(null);
    setActivePortal(role);
    if (role === "student") setIsStudentLoggedIn(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setModal(null); setLoginRole(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Portals */}
      {activePortal === "student" && <StudentDashboard onClose={() => setActivePortal(null)} onAddPending={addPending} />}
      {activePortal === "instructor" && <InstructorDashboard onClose={() => setActivePortal(null)} />}
      {activePortal === "admin" && <AdminDashboard onClose={() => setActivePortal(null)} pendingPayments={pendingPayments} onUpdatePayment={(id, status, note) => setPendingPayments(prev => prev.map(p => p.id === id ? { ...p, status, reviewNote: note } : p))} />}

      {/* Modals */}
      {modal === "login" && (
        <LoginModal role={loginRole} onClose={() => setModal(null)} onSuccess={handleLoginSuccess}
          onRegister={() => setModal("register")} />
      )}
      {modal === "register" && (
        <RegisterModal onClose={() => setModal(null)} onLoginSwitch={() => setModal("login")} />
      )}
      {purchaseService && (
        <PurchasePlanModal
          service={purchaseService}
          onClose={() => setPurchaseService(null)}
          isLoggedIn={isStudentLoggedIn}
          onAddPending={addPending}
        />
      )}

      {/* Promo banner */}
      {promoBanner && (
        <div className="bg-primary text-white py-2.5 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold flex-1">
            <AlertCircle size={14} className="shrink-0" />
            <span><strong>LIMITED OFFER:</strong> First 10 customers get R150–R200 OFF their first lesson bundle!</span>
          </div>
          <button onClick={() => setPromoBanner(false)} className="text-white/80 hover:text-white shrink-0"><X size={15} /></button>
        </div>
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollTo(heroRef, "home")}><Logo size="sm" /></button>

            <div className="hidden md:flex items-center gap-0.5">
              {([
                { label: "Home", section: "home" as NavSection, ref: heroRef },
                { label: "Services", section: "services" as NavSection, ref: servicesRef },
                { label: "Portals", section: "portals" as NavSection, ref: portalsRef },
                { label: "About", section: "about" as NavSection, ref: aboutRef },
                { label: "Contact", section: "contact" as NavSection, ref: contactRef },
              ] as const).map((item) => (
                <button key={item.section} onClick={() => scrollTo(item.ref, item.section)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${activeSection === item.section ? "text-primary border-b-2 border-primary" : "text-foreground hover:text-primary"}`}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => openLogin("student")} className="text-sm font-semibold text-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
                <LogIn size={14} /> Login
              </button>
              <button onClick={openRegister} className="border border-foreground text-foreground text-sm font-bold uppercase tracking-wider px-4 py-2 hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5">
                <UserPlus size={14} /> Register
              </button>
              <RedBtn onClick={() => scrollTo(servicesRef, "services")} className="px-4 py-2">Book Now</RedBtn>
            </div>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border">
            <div className="px-4 py-3 space-y-1">
              {([
                { label: "Home", section: "home" as NavSection, ref: heroRef },
                { label: "Services & Pricing", section: "services" as NavSection, ref: servicesRef },
                { label: "Portals", section: "portals" as NavSection, ref: portalsRef },
                { label: "About", section: "about" as NavSection, ref: aboutRef },
                { label: "Contact", section: "contact" as NavSection, ref: contactRef },
              ] as const).map((item) => (
                <button key={item.section} onClick={() => scrollTo(item.ref, item.section)}
                  className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                  {item.label}
                </button>
              ))}
              <div className="pt-2 space-y-2">
                <button onClick={() => { setMobileOpen(false); openLogin("student"); }} className="w-full py-2.5 border border-border text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <LogIn size={14} /> Login
                </button>
                <button onClick={() => { setMobileOpen(false); openRegister(); }} className="w-full py-2.5 border border-border text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <UserPlus size={14} /> Register
                </button>
                <RedBtn className="w-full" onClick={() => scrollTo(servicesRef, "services")}>Book Now</RedBtn>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative bg-secondary overflow-hidden min-h-[88vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop&auto=format" alt="Car driving on a road" className="w-full h-full object-cover opacity-25" />
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-24 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-8">
              <span>Est. Since 2026</span><span className="w-1 h-1 bg-white rounded-full" /><span>South Africa</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase text-white leading-none tracking-tight mb-6" style={bb()}>
              We Drive<br /><span className="text-primary">You Forward.</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
              Professional driving lessons for Code 1, 8, 10, and 14 licenses. Expert instructors, flexible scheduling, and a platform built for your success.
            </p>
            <div className="flex flex-wrap gap-3">
              <RedBtn onClick={() => scrollTo(servicesRef, "services")} className="flex items-center gap-2">
                View Courses <ArrowRight size={15} />
              </RedBtn>
              <button onClick={openRegister} className="border border-white/30 text-white px-7 py-3 font-bold uppercase tracking-wider text-sm hover:border-white/60 transition-colors flex items-center gap-2">
                <UserPlus size={15} /> Register Free
              </button>
            </div>
            <div className="mt-12 flex flex-wrap gap-6">
              {[{ icon: Shield, label: "Licensed & Certified" }, { icon: Users, label: "50+ Active Students" }, { icon: CheckCircle, label: "High Pass Rate" }].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-2 text-white/70">
                    <Icon size={14} className="text-primary" />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden md:block">
            <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={15} className="text-primary" />
                <span className="text-white text-sm font-semibold">Quick Booking Enquiry</span>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { type: "select", placeholder: "Select Course Type", opts: ["Code 8 – Light Motor Vehicle", "Code 10 – Heavy Motor Vehicle", "Code 14 – Extra Heavy", "Code 1 – Motorcycle", "Learners License"] },
                  { type: "text", placeholder: "Your Full Name", opts: [] },
                  { type: "tel", placeholder: "Phone Number", opts: [] },
                ].map((f, i) => (
                  f.type === "select"
                    ? <select key={i} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2.5 text-sm focus:outline-none">
                        <option className="text-foreground">Select Course Type</option>
                        {f.opts.map(o => <option key={o} className="text-foreground">{o}</option>)}
                      </select>
                    : <input key={i} type={f.type} placeholder={f.placeholder} className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-3 py-2.5 text-sm focus:outline-none" />
                ))}
              </div>
              <RedBtn className="w-full">Request a Callback</RedBtn>
              <p className="text-white/40 text-xs text-center mt-3">We respond within 2 business hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section ref={servicesRef} className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <SectionLabel>Services & Pricing</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-black uppercase leading-none" style={bb()}>Choose Your<br />License Code</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">All courses include study materials and instructor guidance. Transport available at R200.</p>
          </div>

          {/* Learners license */}
          <div className="bg-secondary text-secondary-foreground p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <FileText size={22} className="text-primary shrink-0" />
              <div>
                <div className="text-white font-black uppercase text-xl" style={bb()}>Learners License</div>
                <div className="text-white/70 text-sm">Includes study material and transportation</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div><div className="text-xs text-white/50 uppercase tracking-wider">Starting from</div><div className="text-3xl font-black text-white" style={bb()}>R950</div></div>
              <div className="text-white/30 text-xl font-light">—</div>
              <div><div className="text-xs text-white/50 uppercase tracking-wider">Up to</div><div className="text-3xl font-black text-primary" style={bb()}>R2,000</div></div>
              <RedBtn onClick={() => scrollTo(contactRef, "contact")}>Enquire</RedBtn>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map((s) => <ServiceCard key={s.code} service={s} onPurchase={(svc) => setPurchaseService(svc)} />)}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">* All prices include VAT. Vehicle hire available on request. Transport (R200) is optional for all courses.</p>
        </div>
      </section>

      {/* ── PORTALS ── */}
      <section ref={portalsRef} className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Secure Portals</div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase text-white leading-none" style={bb()}>Your Dedicated<br />Dashboard</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: "student" as Portal, title: "Student Portal", icon: BookOpen, desc: "Book lessons, track your driving progress, access study materials, and manage payments — all in one place.", features: ["Lesson Booking with Calendar", "K53 Practice Quiz", "Progress Tracking", "Secure Online Payment", "Messaging with Instructor"], cta: "Access Student Portal" },
              { role: "instructor" as Portal, title: "Instructor Portal", icon: Calendar, desc: "Manage your daily schedule, update student progress logs, and communicate directly with your students.", features: ["Daily Schedule View", "Student Progress Logs", "Quick Reminder Templates", "Internal Messaging", "Booking Management"], cta: "Access Instructor Portal" },
              { role: "admin" as Portal, title: "Admin Portal", icon: BarChart2, desc: "Full business control — create courses, assign instructors, generate financial reports, and handle all inquiries.", features: ["Course Management", "Instructor Assignment", "Financial Reporting", "Inquiry Handling", "Revenue Analytics"], cta: "Access Admin Portal" },
            ].map((p, i) => {
              const Icon = p.icon;
              const isPrimary = i === 0;
              return (
                <div key={p.role?.toString()} className={`border flex flex-col ${isPrimary ? "border-primary bg-primary/5" : "border-white/10 bg-white/5"}`}>
                  <div className={`p-5 border-b ${isPrimary ? "border-primary/30" : "border-white/10"}`}>
                    <div className={`w-10 h-10 flex items-center justify-center mb-4 ${isPrimary ? "bg-primary" : "bg-white/10"}`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-black uppercase text-white mb-2" style={bb()}>{p.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="p-5 flex-1 space-y-2">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-primary shrink-0" />
                        <span className="text-white/70 text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 pt-0">
                    <button onClick={() => openLogin(p.role)} className={`w-full py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-opacity hover:opacity-90 ${isPrimary ? "bg-primary text-white" : "border border-white/30 text-white"}`}>
                      <LogIn size={14} />{p.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <SectionLabel>Simple Process</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black uppercase leading-none" style={bb()}>How It Works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border divide-x divide-y sm:divide-y-0 divide-border">
            {[
              { step: "01", title: "Register", desc: "Create your free student account online or contact us directly to get started in minutes." },
              { step: "02", title: "Choose a Course", desc: "Select your license code and lesson package. Add vehicle hire or transport if needed." },
              { step: "03", title: "Book & Pay", desc: "Pick your date, time, and instructor using the calendar. Pay securely online." },
              { step: "04", title: "Pass Your Test", desc: "Complete your lessons, track progress, use our K53 quiz, and pass with confidence." },
            ].map((step, i) => (
              <div key={step.step} className={`p-7 relative ${i === 0 ? "bg-primary text-white" : "bg-background"}`}>
                <div className={`text-6xl font-black leading-none mb-4 ${i === 0 ? "text-white/20" : "text-muted"}`} style={bb()}>{step.step}</div>
                <h3 className={`text-xl font-black uppercase mb-2 ${i === 0 ? "text-white" : "text-foreground"}`} style={bb()}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${i === 0 ? "text-white/70" : "text-muted-foreground"}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section ref={aboutRef} className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <SectionLabel>About Us</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black uppercase leading-none mb-6" style={bb()}>Trusted Driving<br />Education Since 2026</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Nthlakusani & Jama Driving School & Shuttle Services was founded with a single mission: to deliver professional, accessible, and effective driving education across South Africa.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our certified instructors bring years of on-road experience across light, heavy, and extra-heavy vehicles. We invest in your success with structured lesson plans, real-time progress tracking, and thorough K53 preparation.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[{ value: "4", label: "License Codes" }, { value: "2", label: "Expert Instructors" }, { value: "100%", label: "Commitment" }].map((s) => (
                <div key={s.label} className="border-l-2 border-primary pl-4">
                  <div className="text-3xl font-black" style={bb()}>{s.value}</div>
                  <div className="text-xs text-muted-foreground font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=700&h=500&fit=crop&auto=format" alt="Professional driving instructor" className="w-full object-cover bg-muted" style={{ aspectRatio: "7/5" }} />
            <div className="absolute top-4 left-4 bg-primary text-white px-4 py-3">
              <div className="text-2xl font-black uppercase" style={bb()}>What Our Students Say</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-14 grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-card border border-border p-6">
              <StarRating rating={t.rating} />
              <p className="text-sm text-foreground leading-relaxed mt-3 mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section ref={contactRef} className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-14">
          <div>
            <SectionLabel>Get In Touch</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black uppercase leading-none mb-6" style={bb()}>Contact &<br />Register</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">Reach out to our team to enquire about courses, pricing, or to start your registration. We respond within 2 business hours.</p>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Tshepo / TR Mafetsa", value: "061 580 6437", href: "tel:+27615806437" },
                { icon: Phone, label: "NB Jama", value: "083 268 7425", href: "tel:+27832687425" },
                { icon: Mail, label: "General Enquiries", value: "info@tlhakusaniholdings.co.za", href: "mailto:info@tlhakusaniholdings.co.za" },
                { icon: Mail, label: "Bookings", value: "pasajama2020@gmail.com", href: "mailto:pasajama2020@gmail.com" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <a key={c.value} href={c.href} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0 mt-0.5"><Icon size={15} className="text-white" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{c.label}</div>
                      <div className="text-sm font-bold group-hover:text-primary transition-colors">{c.value}</div>
                    </div>
                  </a>
                );
              })}
            </div>
            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 flex items-start gap-3">
              <AlertCircle size={15} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <strong>First 10 customers</strong> receive R150–R200 OFF their first lesson bundle. Mention this offer when you register or contact us!
              </p>
            </div>
          </div>

          <div className="bg-background border border-border p-7">
            <h3 className="text-2xl font-black uppercase mb-5" style={bb()}>Send an Enquiry</h3>
            <div className="space-y-4">
              {[
                { label: "Full Name", type: "text", placeholder: "Your full name" },
                { label: "Email Address", type: "email", placeholder: "your@email.com" },
                { label: "Phone Number", type: "tel", placeholder: "0xx xxx xxxx" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Course Interest</label>
                <select className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Select a course…</option>
                  <option>Learners License</option>
                  <option>Code 8 – Light Motor Vehicle</option>
                  <option>Code 10 – Heavy Motor Vehicle</option>
                  <option>Code 14 – Extra Heavy</option>
                  <option>Code 1 – Motorcycle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Message</label>
                <textarea rows={4} placeholder="Tell us more about your requirements…" className="w-full bg-input-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <RedBtn className="w-full">Send Enquiry</RedBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-secondary text-secondary-foreground">
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <Logo size="md" />
              <p className="text-white/50 text-sm mt-4 max-w-xs leading-relaxed">Professional driving education across all license codes. Empowering South African drivers since 2026.</p>
              <p className="text-primary font-black uppercase text-xl mt-4" style={bb()}>"We Drive You Forward!"</p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4" style={bb()}>Quick Links</h4>
              <ul className="space-y-2">
                {["Services & Pricing", "Student Portal", "Instructor Portal", "Admin Portal", "Contact Us"].map((l) => (
                  <li key={l}><button className="text-white/50 text-sm hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={11} />{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4" style={bb()}>Our Courses</h4>
              <ul className="space-y-2">
                {["Learners License", "Code 8 – Light Vehicle", "Code 10 – Heavy Vehicle", "Code 14 – Extra Heavy", "Code 1 – Motorcycle"].map((c) => (
                  <li key={c}><button className="text-white/50 text-sm hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight size={11} />{c}</button></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">© 2026 Nthlakusani & Jama Driving School & Shuttle Services. All rights reserved.</p>
          <div className="flex gap-5">
            <button className="text-white/30 text-xs hover:text-white/60 transition-colors">Privacy Policy</button>
            <button className="text-white/30 text-xs hover:text-white/60 transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
