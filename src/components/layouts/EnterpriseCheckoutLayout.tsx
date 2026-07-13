import React from "react";
import logoMark from "@/assets/login-abstract.webp";
import RevealFooter from "../RevealFooter";

interface BaseLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentStep?: "plano" | "empresa" | "pagamento" | "acesso";
}

export const EnterpriseCheckoutLayout = ({ children, title, currentStep }: BaseLayoutProps) => {
  const steps = [
    { id: "plano", label: "Plano" },
    { id: "empresa", label: "Empresa" },
    { id: "pagamento", label: "Pagamento" },
    { id: "acesso", label: "Acesso" }
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <>
      <div className="min-h-screen bg-[#F7F4F2] font-montserrat flex flex-col relative z-10 shadow-2xl">
        <header className="h-20 lg:h-20 bg-transparent border-b border-[#0B0908]/5">
          <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden shrink-0">
                <img src={logoMark} alt="Meu Caminho" className="h-8 w-8 object-contain" style={{ mixBlendMode: "multiply" }} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-playfair text-lg font-bold text-[#0B0908]">Meu Caminho</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#F88A2B] mt-1">Enterprise</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto w-full px-6 pt-4 lg:pt-6 pb-12 flex-1 flex flex-col">
          {currentStep && (
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto mb-4">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex-1 flex flex-col gap-2">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${idx <= currentIdx ? "bg-[#F88A2B]" : "bg-[#0B0908]/10"}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${idx <= currentIdx ? "text-[#F88A2B]" : "text-[#0B0908]/30"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex-1">
            {children}
          </div>
        </div>

        {/* Spacer to reveal footer */}
        <div className="h-[600px] md:h-[400px] pointer-events-none" />
      </div>
      
      <RevealFooter />
    </>
  );
};
