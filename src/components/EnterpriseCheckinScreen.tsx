import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2,
  Brain,
  CloudRain,
  Sparkles,
  Scale,
  Briefcase,
  BatteryMedium
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

interface Question {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  options: string[];
  reflexion: string;
}

const questions: Question[] = [
  {
    id: 1,
    title: "Como está sua mente nos últimos dias?",
    subtitle: "Responda com sinceridade. Este é um espaço privado de percepção.",
    icon: Brain,
    options: ["Muito tranquila", "Um pouco inquieta", "Acelerada", "Muito acelerada", "Exausta de tanto pensar"],
    reflexion: "Perceber já é o primeiro passo para reorganizar a mente."
  },
  {
    id: 2,
    title: "Como está sua carga emocional esta semana?",
    subtitle: "Sinta seu corpo e suas emoções sem julgamentos.",
    icon: CloudRain,
    options: ["Leve", "Administrável", "Pesada", "Muito pesada", "No limite"],
    reflexion: "Dar nome ao que sentimos diminui a intensidade da pressão."
  },
  {
    id: 3,
    title: "Você sente clareza para tomar decisões?",
    subtitle: "A clareza mental é o GPS da nossa inteligência.",
    icon: Sparkles,
    options: ["Muita clareza", "Boa clareza", "Alguma dúvida", "Pouca clareza", "Estou confuso(a)"],
    reflexion: "A clareza surge quando silenciamos os ruídos externos."
  },
  {
    id: 4,
    title: "Como está seu equilíbrio entre vida e trabalho?",
    subtitle: "Sua produtividade não define seu valor como ser humano.",
    icon: Scale,
    options: ["Muito equilibrado", "Relativamente equilibrado", "Oscilando", "Desequilibrado", "Sem espaço para mim"],
    reflexion: "O equilíbrio não é algo que encontramos, é algo que criamos."
  },
  {
    id: 5,
    title: "Como você se sente em relação ao seu trabalho hoje?",
    subtitle: "Sua relação com o que faz impacta diretamente sua paz.",
    icon: Briefcase,
    options: ["Satisfeito(a)", "Motivado(a)", "Neutro(a)", "Desgastado(a)", "Desconectado(a)"],
    reflexion: "Sua motivação floresce onde há propósito e reconhecimento."
  },
  {
    id: 6,
    title: "Como está sua energia para continuar crescendo?",
    subtitle: "Cuidar da energia é tão vital quanto cuidar do tempo.",
    icon: BatteryMedium,
    options: ["Alta", "Boa", "Média", "Baixa", "Preciso recuperar forças"],
    reflexion: "Às vezes, parar para descansar é a forma mais rápida de avançar."
  }
];

export default function EnterpriseCheckinScreen() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isSelected = answers[currentQuestion.id] !== undefined;

  const handleSelect = (index: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: index });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/enterprise/checkin/resultado');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const Icon = currentQuestion.icon;
  const isLast = currentStep === questions.length - 1;

  return (
    <EnterpriseUserLayout title="Check-in Semanal">
      <div className="animate-fade-in relative z-10 w-full lg:h-[calc(100vh-140px)] flex flex-col">
        
        {/* Progress Section */}
        <div className="w-full max-w-full mx-auto mb-6 lg:mb-8 px-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="h-10 w-10 flex lg:hidden items-center justify-center rounded-full bg-white shadow-sm border border-black/5"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999]">Check-in semanal</span>
                <span className="hidden lg:block h-1 w-1 rounded-full bg-[#F88A2B]/40" />
                <span className="text-[13px] font-bold text-[#F88A2B]">Pergunta {currentStep + 1} de {questions.length}</span>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2 text-[#999]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Privacidade 100% Ativa</span>
            </div>
          </div>
          
          <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#F88A2B] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(248,138,43,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="w-full max-w-full flex-1 flex flex-col lg:overflow-hidden">
          <div className="lg:bg-white lg:p-10 lg:rounded-[40px] lg:shadow-[0_20px_60px_rgba(0,0,0,0.04)] lg:border lg:border-black/5 flex-1 flex flex-col min-h-0">
            
            {/* Question Header */}
            <div className="mb-6 lg:mb-8 text-center lg:text-left animate-fade-up shrink-0">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F88A2B08] text-[#F88A2B] mb-4 border border-[#F88A2B05]">
                <Icon className="h-6 w-6" />
              </div>
              <h1 
                className="text-[24px] lg:text-[32px] leading-[1.15] font-bold text-[#111] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {currentQuestion.title}
              </h1>
              <p className="text-[14px] lg:text-[16px] leading-relaxed text-[#666] font-medium max-w-[600px] lg:mx-0 mx-auto">
                {currentQuestion.subtitle}
              </p>
            </div>

            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 min-h-0">
              {/* Options Grid (2x2) */}
              <div className="lg:col-span-8 overflow-y-auto no-scrollbar pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentQuestion.options.map((option, index) => {
                    const selected = answers[currentQuestion.id] === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className={`w-full p-5 rounded-[24px] text-left transition-all duration-300 border group h-full flex flex-col justify-between ${
                          selected 
                            ? "bg-white border-[#F88A2B] shadow-[0_12px_24px_-10px_rgba(248,138,43,0.3)] ring-1 ring-[#F88A2B]/5" 
                            : "bg-white border-black/5 shadow-sm hover:border-[#F88A2B]/30 hover:bg-[#F88A2B02]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className={`text-[15px] font-bold leading-tight ${selected ? "text-[#F88A2B]" : "text-[#444] group-hover:text-[#111]"}`}>
                            {option}
                          </span>
                          <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                            selected 
                              ? "bg-[#F88A2B] border-[#F88A2B]" 
                              : "bg-transparent border-black/10 group-hover:border-[#F88A2B]/30"
                          }`}>
                            {selected && <CheckCircle2 className="h-3 w-3 text-[#111]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar: Reflexion & Action */}
              <div className="lg:col-span-4 flex flex-col gap-6 shrink-0">
                {/* Reflexion Box */}
                <div className="flex-1 min-h-[120px] lg:min-h-0 flex flex-col justify-center">
                  {isSelected ? (
                    <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[32px] p-6 lg:p-8 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#F88A2B]/10 blur-3xl" />
                      <div className="relative z-10 flex flex-col items-center text-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-[#F88A2B]" />
                        </div>
                        <p className="text-[15px] lg:text-[18px] font-bold italic leading-relaxed text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          <span className="text-[#F88A2B]">“</span>{currentQuestion.reflexion}<span className="text-[#F88A2B]">”</span>
                        </p>
                        <div className="h-0.5 w-8 bg-[#F88A2B]/30 rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/40 backdrop-blur-sm border border-dashed border-black/10 rounded-[32px] p-8 flex flex-col items-center justify-center text-center gap-3">
                      <Brain className="h-5 w-5 text-[#999]" />
                      <div className="space-y-1">
                        <p className="text-[13px] font-bold text-[#111]">Reflexão do Momento</p>
                        <p className="text-[11px] font-medium text-[#666]">Selecione uma resposta para continuar.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons Box */}
                <div className="space-y-4">
                  <button
                    onClick={handleNext}
                    disabled={!isSelected}
                    className="w-full h-14 rounded-full flex items-center justify-center gap-3 text-[#111] font-bold text-[15px] transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F88A2B]/20"
                    style={{ 
                      background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)",
                    }}
                  >
                    <span>{isLast ? "Finalizar Check-in" : "Próxima Pergunta"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={handleBack}
                      className="text-[12px] font-bold text-[#999] hover:text-[#111] transition-colors uppercase tracking-widest"
                    >
                      Voltar
                    </button>
                    <span className="h-1 w-1 rounded-full bg-black/10" />
                    <div className="flex items-center gap-1.5 text-[#CCC]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Anônimo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </EnterpriseUserLayout>
  );
}
