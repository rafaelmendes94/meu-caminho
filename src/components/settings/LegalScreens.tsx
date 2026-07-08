import { Phone, SubHeader, card, serifFont } from "./Phone";
import BottomNav from "../BottomNav";
import { AppUserLayout } from "../layouts/AppUserLayout";

type Block = { h?: string; p: string };

const Doc = ({ title, intro, blocks, updated }: { title: string; intro: string; blocks: Block[]; updated: string }) => (
  <AppUserLayout>
    <Phone>
      <SubHeader title={title} />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-8 scrollbar-hide">
        <div className={`${card} mt-4 py-5`}>
          <p className="text-[10.5px] tracking-[0.18em] text-[#B58A5A] font-semibold uppercase">Atualizado em</p>
          <p className="text-[12px] text-[#666] mt-1">{updated}</p>
        </div>

        <article className={`${card} mt-4 py-5 space-y-4`}>
          <p style={serifFont} className="text-[20px] leading-tight text-[#111]">{title}</p>
          <p className="text-[13px] text-[#444] leading-relaxed">{intro}</p>
          {blocks.map((b, i) => (
            <div key={i} className="space-y-1.5">
              {b.h && <h3 style={serifFont} className="text-[15px] text-[#111]">{b.h}</h3>}
              <p className="text-[13px] text-[#444] leading-relaxed whitespace-pre-line">{b.p}</p>
            </div>
          ))}
        </article>

        <p className="text-center text-[10.5px] text-[#B8B0A8] mt-6">Meu Caminho · Augusto Cury</p>
      </div>
      <BottomNav />
    </Phone>
  </AppUserLayout>
);

export const PrivacyScreen = () => (
  <Doc
    title="Privacidade e segurança"
    updated="14 de maio de 2026"
    intro="Sua privacidade é fundamental para nós. Esta página resume como protegemos seus dados e quais controles você tem sobre eles."
    blocks={[
      { h: "Dados que coletamos", p: "Coletamos apenas o necessário para personalizar sua jornada: nome, e-mail, progresso nas trilhas e preferências de uso. Não vendemos seus dados." },
      { h: "Como usamos", p: "Usamos seus dados para: (1) recomendar conteúdos relevantes, (2) acompanhar sua evolução emocional, (3) melhorar a experiência do app." },
      { h: "Segurança", p: "Empregamos criptografia em trânsito e em repouso, autenticação segura e auditorias regulares de acesso." },
      { h: "Seus controles", p: "Você pode pedir exportação, correção ou exclusão dos seus dados a qualquer momento em Configurações > Privacidade." },
      { h: "Contato", p: "Em caso de dúvidas, fale com privacidade@meucaminho.app" },
    ]}
  />
);

export const TermsScreen = () => (
  <Doc
    title="Termos de uso"
    updated="14 de maio de 2026"
    intro="Bem-vinda(o) ao Meu Caminho. Ao usar o app, você concorda com os termos abaixo, escritos para serem claros e justos."
    blocks={[
      { h: "Sobre o serviço", p: "O Meu Caminho oferece conteúdos, trilhas e ferramentas de evolução emocional inspirados na obra do Dr. Augusto Cury. O conteúdo é educativo e não substitui acompanhamento médico ou psicológico." },
      { h: "Sua conta", p: "Você é responsável por manter suas credenciais seguras. Use o app de forma respeitosa e dentro da lei." },
      { h: "Assinatura", p: "Planos premium são cobrados conforme indicado no momento da compra. Você pode cancelar a qualquer momento, sem multa, mantendo o acesso até o fim do período pago." },
      { h: "Propriedade intelectual", p: "Todo o conteúdo é protegido por direitos autorais. É proibido redistribuir, copiar ou comercializar materiais sem autorização." },
      { h: "Limitação de responsabilidade", p: "Fazemos o nosso melhor para que tudo funcione bem, mas não garantimos disponibilidade ininterrupta. Não nos responsabilizamos por decisões tomadas com base no conteúdo do app." },
      { h: "Mudanças", p: "Estes termos podem ser atualizados. Avisaremos sobre mudanças relevantes por e-mail ou dentro do app." },
    ]}
  />
);

export const PolicyScreen = () => (
  <Doc
    title="Política de privacidade"
    updated="14 de maio de 2026"
    intro="Esta política descreve como tratamos suas informações pessoais ao usar o Meu Caminho, em conformidade com a LGPD e boas práticas internacionais."
    blocks={[
      { h: "1. Informações coletadas", p: "• Cadastro: nome, e-mail e data de nascimento.\n• Uso: progresso, conteúdos consumidos, preferências.\n• Técnicas: tipo de dispositivo, sistema, idioma e dados de desempenho." },
      { h: "2. Bases legais", p: "Tratamos seus dados com base em consentimento, execução de contrato (assinatura) e legítimo interesse para melhorias do serviço." },
      { h: "3. Compartilhamento", p: "Compartilhamos dados apenas com fornecedores essenciais (hospedagem, e-mail, pagamentos), todos sob contrato e cláusulas de proteção." },
      { h: "4. Retenção", p: "Mantemos seus dados pelo tempo necessário para prestar o serviço. Após exclusão da conta, dados são apagados em até 30 dias, salvo obrigação legal." },
      { h: "5. Direitos do titular", p: "Você pode solicitar acesso, correção, portabilidade, anonimização e exclusão de dados a qualquer momento." },
      { h: "6. Cookies e analytics", p: "Usamos ferramentas de analytics agregados para entender padrões de uso. Você pode desativar em Configurações > Privacidade." },
      { h: "7. Encarregado (DPO)", p: "Para exercer seus direitos: dpo@meucaminho.app" },
    ]}
  />
);
