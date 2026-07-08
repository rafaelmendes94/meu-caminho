import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  FileText, 
  Download, 
  Sparkles,
  LayoutGrid,
  Info,
  ShieldCheck,
  Zap
} from "lucide-react";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EmptyStateCard = ({ 
  icon: Icon, 
  title, 
  description, 
  buttonText, 
  onClick, 
  note 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  buttonText: string, 
  onClick: () => void, 
  note?: string 
}) => (
  <div className="bg-white rounded-3xl p-8 border border-[#F0EBE8] shadow-sm transition-all duration-300 hover:shadow-md">
    <div className="w-14 h-14 bg-[#F7F4F2] rounded-2xl flex items-center justify-center mb-6">
      <Icon className="w-7 h-7 text-[#F88A2B]" />
    </div>
    <h3 className="text-xl font-['Playfair_Display'] text-[#0B0908] mb-3 leading-tight">{title}</h3>
    <p className="text-[#0B0908]/60 text-sm leading-relaxed mb-6 font-['Montserrat']">
      {description}
    </p>
    <button 
      onClick={onClick}
      className="text-[#F88A2B] font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all duration-300"
    >
      {buttonText}
      <ArrowLeft className="w-4 h-4 rotate-180" />
    </button>
    {note && (
      <div className="mt-6 pt-6 border-t border-[#F0EBE8] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#0B0908]/30 mt-0.5" />
        <p className="text-[11px] text-[#0B0908]/40 uppercase tracking-wider font-medium">
          {note}
        </p>
      </div>
    )}
  </div>
);

const EnterpriseEmptyStatesScreen = () => {
  const navigate = useNavigate();

  return (
    <EnterpriseRHLayout title="Estados vazios">
      <div className="space-y-8 animate-fade-in py-2">
        {/* Hero */}
        <div className="mt-6 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 relative overflow-hidden mb-12 shadow-2xl shadow-[#0B0908]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] text-[#F88A2B] font-bold uppercase tracking-[0.2em] border border-[#F88A2B]/30 px-3 py-1 rounded-full">
                UX Enterprise
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] text-[#111] mb-4 leading-tight">
              Quando ainda não há dados, a experiência também precisa cuidar.
            </h2>
            <p className="text-[#F7F4F2]/60 text-sm md:text-base font-['Montserrat'] leading-relaxed max-w-lg">
              Estados vazios orientam RH e liderança sem gerar ansiedade, ruído ou sensação de erro.
            </p>
            <div className="mt-8 w-12 h-0.5 bg-gradient-to-r from-[#F88A2B] to-transparent opacity-50" />
          </div>
        </div>

        {/* Section Grid */}
        <div className="space-y-12">
          {/* Sem dados suficientes */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem dados suficientes
            </h4>
            <EmptyStateCard 
              icon={Search}
              title="Ainda não há respostas suficientes."
              description="Assim que mais colaboradores realizarem o check-in, os primeiros sinais coletivos aparecerão aqui."
              buttonText="Ver equipe"
              onClick={() => navigate('/enterprise/rh/equipe')}
              note="Recortes só aparecem com volume mínimo para proteger anonimato."
            />
          </section>

          {/* Sem áreas cadastradas */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem áreas cadastradas
            </h4>
            <EmptyStateCard 
              icon={LayoutGrid}
              title="Nenhuma área configurada ainda."
              description="Cadastre departamentos para acompanhar tendências coletivas por grupo, sempre com proteção de identidade."
              buttonText="Configurar áreas"
              onClick={() => navigate('/enterprise/rh/configuracoes')}
            />
          </section>

          {/* Sem alertas */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem alertas
            </h4>
            <EmptyStateCard 
              icon={ShieldCheck}
              title="Nenhuma área em alerta esta semana."
              description="O equilíbrio coletivo permanece estável. Continue acompanhando a evolução emocional do time."
              buttonText="Ver dashboard"
              onClick={() => navigate('/enterprise/rh/dashboard')}
            />
          </section>

          {/* Sem relatórios gerados */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem relatórios gerados
            </h4>
            <EmptyStateCard 
              icon={FileText}
              title="Nenhum relatório executivo foi gerado."
              description="Quando houver dados suficientes, você poderá gerar uma leitura executiva para liderança."
              buttonText="Gerar relatório"
              onClick={() => navigate('/enterprise/rh/relatorio')}
            />
          </section>

          {/* Sem colaboradores ativos */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem colaboradores ativos
            </h4>
            <EmptyStateCard 
              icon={Users}
              title="O time ainda não ativou a jornada."
              description="Envie convites para que colaboradores acessem o benefício Enterprise com privacidade."
              buttonText="Convidar equipe"
              onClick={() => navigate('/enterprise/rh/equipe')}
            />
          </section>

          {/* Sem integrações */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem integrações
            </h4>
            <EmptyStateCard 
              icon={Zap}
              title="Nenhuma integração conectada."
              description="Conecte Slack, Teams ou Google Workspace para levar lembretes conscientes à rotina da empresa."
              buttonText="Conectar integrações"
              onClick={() => navigate('/enterprise/rh/integracoes')}
            />
          </section>

          {/* Sem exportações */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem exportações
            </h4>
            <EmptyStateCard 
              icon={Download}
              title="Ainda não há exportações."
              description="Relatórios exportados aparecerão aqui quando forem gerados."
              buttonText="Criar exportação"
              onClick={() => navigate('/enterprise/rh/exportacoes')}
            />
          </section>

          {/* Sem insights de IA */}
          <section>
            <h4 className="text-[11px] text-[#0B0908]/40 uppercase tracking-[0.2em] font-bold mb-6 ml-1">
              Sem insights de IA
            </h4>
            <EmptyStateCard 
              icon={Sparkles}
              title="A IA ainda está aguardando padrões coletivos."
              description="Insights aparecem apenas quando houver volume suficiente de respostas agregadas."
              buttonText="Ver privacidade"
              onClick={() => navigate('/enterprise/rh/privacidade')}
            />
          </section>

          {/* Princípio de design */}
          <section className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/5 blur-[80px] rounded-full -mr-20 -mt-20" />
            <div className="relative z-10">
              <h3 className="text-2xl font-['Playfair_Display'] text-[#111] mb-4">
                Estado vazio não é ausência. É orientação.
              </h3>
              <p className="text-[#F7F4F2]/60 text-sm font-['Montserrat'] leading-relaxed mb-8">
                Cada tela vazia deve explicar o que falta, por que isso acontece e qual próximo passo seguro o usuário pode tomar.
              </p>
              
              <button 
                onClick={() => navigate('/enterprise/rh')}
                className="w-full bg-[#F88A2B] text-[#111] font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#E07A26] active:scale-95 shadow-xl shadow-[#F88A2B]/20"
              >
                Voltar ao módulo RH
              </button>
            </div>
          </section>
        </div>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseEmptyStatesScreen;
