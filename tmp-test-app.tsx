import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import EnterpriseCuryDigitalScreen from "./components/EnterpriseCuryDigitalScreen.tsx";
import CanalDiretoRHScreen from "./components/CanalDiretoRHScreen.tsx";
import CanalDiretoMensagemScreen from "./components/CanalDiretoMensagemScreen.tsx";
import CanalDiretoConfirmacaoScreen from "./components/CanalDiretoConfirmacaoScreen.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import HomeScreen from "./components/HomeScreen.tsx";
import AuthGate from "./components/AuthGate.tsx";
import ProfileScreen from "./components/ProfileScreen.tsx";
import WelcomeScreen from "./components/WelcomeScreen.tsx";
import ChatAIScreen from "./components/ChatAIScreen.tsx";
import PreloaderRoute from "./components/PreloaderRoute.tsx";
import AboutExpertScreen from "./components/AboutExpertScreen.tsx";
import VideoContentScreen from "./components/VideoContentScreen.tsx";
import AudioReadingScreen from "./components/AudioReadingScreen.tsx";
import BlogReadingScreen from "./components/BlogReadingScreen.tsx";
import ExploreScreen from "./components/ExploreScreen";
import FeedScreen from "./components/FeedScreen";
import AudioPlayerScreen from "./components/AudioPlayerScreen";
import ContentDetailScreen from "./components/ContentDetailScreen";
import PodcastPlayerScreen from "./components/PodcastPlayerScreen";
import VideoShortsScreen from "./components/VideoShortsScreen";
import AudiobookScreen from "./components/AudiobookScreen";
import FeedCategoriesScreen from "./components/FeedCategoriesScreen";
import SavedContentScreen from "./components/SavedContentScreen";
import ContinueWatchingScreen from "./components/ContinueWatchingScreen";
import CampaignsScreen from "./components/CampaignsScreen";
import GuestProfileScreen from "./components/GuestProfileScreen";
import LibraryScreen from "./components/LibraryScreen";
import BookUnlockedScreen from "./components/BookUnlockedScreen";
import BookLockedScreen from "./components/BookLockedScreen";
import BookReaderScreen from "./components/BookReaderScreen";
import ThemedLibraryScreen from "./components/ThemedLibraryScreen";
import BookDetailScreen from "./components/BookDetailScreen";
import NewReleaseScreen from "./components/NewReleaseScreen";
import MonthlyBooksScreen from "./components/MonthlyBooksScreen";
import MyReadingScreen from "./components/MyReadingScreen";
import ReadingProgressScreen from "./components/ReadingProgressScreen";
import BookChaptersScreen from "./components/BookChaptersScreen";
import TrilhaScreen from "./components/TrilhaScreen.tsx";
import JourneyOverviewScreen from "./components/JourneyOverviewScreen.tsx";
import DiagnosticoScreen from "./components/DiagnosticoScreen.tsx";
import CursoScreen from "./components/CursoScreen.tsx";
import ModulosScreen from "./components/ModulosScreen.tsx";
import AulaPlayerScreen from "./components/AulaPlayerScreen.tsx";
import MateriaisScreen from "./components/MateriaisScreen.tsx";
import ProgressoScreen from "./components/ProgressoScreen.tsx";
import ProvaFinalScreen from "./components/ProvaFinalScreen.tsx";
import ResultadoProvaScreen from "./components/ResultadoProvaScreen.tsx";
import CursoDesbloqueadoScreen from "./components/CursoDesbloqueadoScreen.tsx";
import DiagnosticoFinalScreen from "./components/DiagnosticoFinalScreen.tsx";
import EvolucaoPessoalScreen from "./components/EvolucaoPessoalScreen.tsx";
import ProximaTrilhaScreen from "./components/ProximaTrilhaScreen.tsx";
import MudancaJornadaScreen from "./components/MudancaJornadaScreen.tsx";
import MudarTrilhaConfirmScreen from "./components/MudarTrilhaConfirmScreen.tsx";
import ConquistaScreen from "./components/ConquistaScreen.tsx";
import CuryDigitalHomeScreen from "./components/CuryDigitalHomeScreen.tsx";
import CuryDigitalChatScreen from "./components/CuryDigitalChatScreen.tsx";
import HistoricoIAScreen from "./components/HistoricoIAScreen.tsx";
import SugestaoTrilhaScreen from "./components/SugestaoTrilhaScreen.tsx";
import RespostaCriticaScreen from "./components/RespostaCriticaScreen.tsx";
import InsightsIAScreen from "./components/InsightsIAScreen.tsx";
import MenuScreen from "./components/MenuScreen.tsx";
import SettingsScreen from "./components/SettingsScreen.tsx";
import HelpCenterScreen from "./components/HelpCenterScreen.tsx";
import NotificationsScreen from "./components/NotificationsScreen.tsx";
import ChangePasswordScreen from "./components/settings/ChangePasswordScreen.tsx";
import ChangeEmailScreen from "./components/settings/ChangeEmailScreen.tsx";
import { LanguageScreen, VideoQualityScreen } from "./components/settings/ChoiceScreens.tsx";
import { PrivacyScreen, TermsScreen, PolicyScreen } from "./components/settings/LegalScreens.tsx";
import HistoryScreen from "./components/HistoryScreen.tsx";
import DownloadsScreen from "./components/DownloadsScreen.tsx";
import FavoritesScreen from "./components/FavoritesScreen.tsx";
import SubscriptionScreen from "./components/SubscriptionScreen.tsx";
import EnterpriseWelcomeScreen from "./components/EnterpriseWelcomeScreen.tsx";
import PrivacyEnterpriseScreen from "./components/PrivacyEnterpriseScreen.tsx";
import EnterpriseHomeScreen from "./components/EnterpriseHomeScreen.tsx";
import EnterpriseCheckinIntroScreen from "./components/EnterpriseCheckinIntroScreen.tsx";
import EnterpriseCheckinScreen from "./components/EnterpriseCheckinScreen.tsx";
import EnterpriseCheckinResultScreen from "./components/EnterpriseCheckinResultScreen.tsx";
import EnterpriseLibraryScreen from "./components/EnterpriseLibraryScreen.tsx";
import EnterpriseRHDashboardScreen from "./components/EnterpriseRHDashboardScreen.tsx";
import EnterpriseCapacityPulseScreen from "./components/EnterpriseCapacityPulseScreen.tsx";
import EnterpriseAlertsScreen from "./components/EnterpriseAlertsScreen.tsx";
import EnterpriseReportScreen from "./components/EnterpriseReportScreen.tsx";
import EnterpriseRHAccessScreen from "./components/EnterpriseRHAccessScreen.tsx";
import EnterpriseTeamManagementScreen from "./components/EnterpriseTeamManagementScreen.tsx";
import EnterpriseCompanySettingsScreen from "./components/EnterpriseCompanySettingsScreen.tsx";
import EnterpriseDepartmentDetailScreen from "./components/EnterpriseDepartmentDetailScreen.tsx";
import EnterpriseActionPlanScreen from "./components/EnterpriseActionPlanScreen.tsx";
import EnterpriseAdminIntegrationScreen from "./components/EnterpriseAdminIntegrationScreen.tsx";
import EnterpriseBenchmarkScreen from "./components/EnterpriseBenchmarkScreen.tsx";
import EnterpriseLeadershipOverviewScreen from "./components/EnterpriseLeadershipOverviewScreen.tsx";
import EnterpriseImpactScreen from "./components/EnterpriseImpactScreen.tsx";
import EnterpriseEmotionalMapScreen from "./components/EnterpriseEmotionalMapScreen.tsx";
import EnterpriseLeadershipMessageScreen from "./components/EnterpriseLeadershipMessageScreen.tsx";
import EnterpriseAIInsightsScreen from "./pages/EnterpriseAIInsightsScreen.tsx";
import EnterpriseJourneyEvolutionScreen from "./components/EnterpriseJourneyEvolutionScreen.tsx";
import EnterpriseRitualsScreen from "./components/EnterpriseRitualsScreen.tsx";
import EnterpriseLeadershipHealthScreen from "./components/EnterpriseLeadershipHealthScreen.tsx";
import EnterprisePermissionsScreen from "./components/EnterprisePermissionsScreen.tsx";
import EnterpriseIntegrationsScreen from "./components/EnterpriseIntegrationsScreen.tsx";
import EnterpriseNotificationsScreen from "./components/EnterpriseNotificationsScreen.tsx";
import EnterpriseExportsScreen from "./components/EnterpriseExportsScreen.tsx";
import EnterprisePrivacyCenterScreen from "./components/EnterprisePrivacyCenterScreen.tsx";
import EnterpriseOnboardingScreen from "./components/EnterpriseOnboardingScreen.tsx";
import EnterpriseEmptyStatesScreen from "./components/EnterpriseEmptyStatesScreen.tsx";
import EnterpriseLoadingStatesScreen from "./components/EnterpriseLoadingStatesScreen.tsx";
import EnterpriseNavigationSystemScreen from "./components/EnterpriseNavigationSystemScreen.tsx";
import EnterpriseDesktopResponsiveScreen from "./components/EnterpriseDesktopResponsiveScreen.tsx";
import EnterpriseSupportScreen from "./pages/EnterpriseSupportScreen.tsx";
import EnterpriseRoadmapScreen from "./pages/EnterpriseRoadmapScreen.tsx";
import EnterpriseLaunchCommunicationScreen from "./pages/EnterpriseLaunchCommunicationScreen.tsx";

import EnterpriseStatusHealthScreen from "./components/EnterpriseStatusHealthScreen.tsx";
import EnterpriseRHReportsScreen from "./components/EnterpriseRHReportsScreen.tsx";
import EnterpriseRHReportDetailScreen from "./components/EnterpriseRHReportDetailScreen.tsx";
import EnterpriseInviteEmployeesScreen from "./components/EnterpriseInviteEmployeesScreen.tsx";

import EnterpriseInviteAcceptanceScreen from "./components/EnterpriseInviteAcceptanceScreen.tsx";
import EnterpriseDepartmentsScreen from "./components/EnterpriseDepartmentsScreen.tsx";
import EnterprisePrivacyConsentScreen from "./components/EnterprisePrivacyConsentScreen.tsx";
import EnterpriseEmployeeRegisterScreen from "./components/EnterpriseEmployeeRegisterScreen.tsx";
import EnterpriseWelcomeJourneyScreen from "./components/EnterpriseWelcomeJourneyScreen.tsx";
import EnterpriseImportEmployeesScreen from "./components/EnterpriseImportEmployeesScreen.tsx";
import EnterpriseLicensesScreen from "./components/EnterpriseLicensesScreen.tsx";
import EnterpriseEmployeeAdminScreen from "./components/EnterpriseEmployeeAdminScreen.tsx";
import EnterpriseAuditLogsScreen from "./components/EnterpriseAuditLogsScreen.tsx";
import EnterpriseDomainAccessScreen from "./components/EnterpriseDomainAccessScreen.tsx";
import EnterpriseDataRetentionScreen from "./pages/EnterpriseDataRetentionScreen.tsx";
import EnterpriseComplianceScreen from "./pages/EnterpriseComplianceScreen.tsx";
import EnterprisePoliciesScreen from "./pages/EnterprisePoliciesScreen.tsx";
import EnterpriseUnitsScreen from "./pages/EnterpriseUnitsScreen.tsx";
import EnterpriseMultiAdminsScreen from "./pages/EnterpriseMultiAdminsScreen.tsx";
import EnterpriseGuidedRitualsScreen from "./pages/EnterpriseGuidedRitualsScreen.tsx";
import EnterpriseAdminCenterScreen from "./pages/EnterpriseAdminCenterScreen.tsx";
import EnterpriseBillingScreen from "./pages/EnterpriseBillingScreen.tsx";
import EnterpriseCheckoutPlanScreen from "./pages/EnterpriseCheckoutPlanScreen.tsx";
import EnterpriseCheckoutCompanyDataScreen from "./pages/EnterpriseCheckoutCompanyDataScreen.tsx";
import EnterpriseCheckoutPaymentScreen from "./pages/EnterpriseCheckoutPaymentScreen.tsx";
import EnterpriseCheckoutSuccessScreen from "./pages/EnterpriseCheckoutSuccessScreen.tsx";
import EnterpriseRHLoginScreen from "./pages/EnterpriseRHLoginScreen.tsx";
import EnterpriseRHWelcomeScreen from "./pages/EnterpriseRHWelcomeScreen.tsx";





import ContactUsScreen from "./components/ContactUsScreen.tsx";
import ReadingSettingsScreen from "./components/settings/ReadingSettingsScreen.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/login" element={<Index />} />
          <Route path="/preloader" element={<PreloaderRoute />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/chat" element={<ChatAIScreen />} />
          <Route path="/perfil" element={<ProfileScreen />} />
          <Route path="/menu" element={<MenuScreen />} />
          <Route path="/configuracoes" element={<SettingsScreen />} />
          <Route path="/configuracoes/senha" element={<ChangePasswordScreen />} />
          <Route path="/configuracoes/email" element={<ChangeEmailScreen />} />
          <Route path="/configuracoes/idioma" element={<LanguageScreen />} />
          <Route path="/configuracoes/leitura" element={<ReadingSettingsScreen />} />
          <Route path="/configuracoes/qualidade" element={<VideoQualityScreen />} />
          <Route path="/configuracoes/privacidade" element={<PrivacyScreen />} />
          <Route path="/configuracoes/termos" element={<TermsScreen />} />
          <Route path="/configuracoes/politica" element={<PolicyScreen />} />
          <Route path="/ajuda" element={<HelpCenterScreen />} />
          <Route path="/fale-conosco" element={<ContactUsScreen />} />
          <Route path="/notificacoes" element={<NotificationsScreen />} />
          <Route path="/historico" element={<HistoryScreen />} />
          <Route path="/downloads" element={<DownloadsScreen />} />
          <Route path="/favoritos" element={<FavoritesScreen />} />
          <Route path="/assinatura" element={<SubscriptionScreen />} />
          <Route path="/sobre-expert" element={<AboutExpertScreen />} />
          <Route path="/conteudo/video" element={<VideoContentScreen />} />
          <Route path="/feed/video" element={<VideoContentScreen />} />
          <Route path="/conteudo/audio" element={<AudioReadingScreen />} />
          <Route path="/player/audio" element={<AudioPlayerScreen />} />
          <Route path="/conteudo/detalhe" element={<ContentDetailScreen />} />
          <Route path="/player/podcast" element={<PodcastPlayerScreen />} />
          <Route path="/player/video" element={<VideoShortsScreen />} />
          <Route path="/feed/cortes" element={<VideoShortsScreen />} />
          <Route path="/player/audiolivro" element={<AudiobookScreen />} />
          <Route path="/feed/categorias" element={<FeedCategoriesScreen />} />
          <Route path="/biblioteca/salvos" element={<SavedContentScreen />} />
          <Route path="/biblioteca/continuar" element={<ContinueWatchingScreen />} />
          <Route path="/campanhas" element={<CampaignsScreen />} />
          <Route path="/convidado" element={<GuestProfileScreen />} />
          <Route path="/convidado/:slug" element={<GuestProfileScreen />} />
          <Route path="/conteudo/leitura" element={<BlogReadingScreen />} />
          <Route path="/feed/leitura" element={<BlogReadingScreen />} />
          <Route path="/explorar" element={<ExploreScreen />} />
          <Route path="/biblioteca" element={<LibraryScreen />} />
          <Route path="/biblioteca/desbloqueado" element={<BookUnlockedScreen />} />
          <Route path="/biblioteca/bloqueado" element={<BookLockedScreen />} />
          <Route path="/biblioteca/leitor" element={<BookReaderScreen />} />
          <Route path="/biblioteca/temas" element={<ThemedLibraryScreen />} />
          <Route path="/biblioteca/detalhe" element={<BookDetailScreen />} />
          <Route path="/biblioteca/nova-liberacao" element={<NewReleaseScreen />} />
          <Route path="/biblioteca/liberados-mes" element={<MonthlyBooksScreen />} />
          <Route path="/biblioteca/minha-leitura" element={<MyReadingScreen />} />
          <Route path="/biblioteca/progresso-leitura" element={<ReadingProgressScreen />} />
          <Route path="/biblioteca/capitulos" element={<BookChaptersScreen />} />
          <Route path="/trilha" element={<TrilhaScreen />} />
          <Route path="/jornada" element={<JourneyOverviewScreen />} />
          <Route path="/diagnostico" element={<DiagnosticoScreen />} />
          <Route path="/curso" element={<CursoScreen />} />
          <Route path="/curso/1" element={<CursoScreen />} />
          <Route path="/modulos" element={<ModulosScreen />} />
          <Route path="/aula" element={<AulaPlayerScreen />} />
          <Route path="/materiais" element={<MateriaisScreen />} />
          <Route path="/progresso" element={<ProgressoScreen />} />
          <Route path="/prova-final" element={<ProvaFinalScreen />} />
          <Route path="/prova-final/resultado" element={<ResultadoProvaScreen />} />
          <Route path="/curso-desbloqueado" element={<CursoDesbloqueadoScreen />} />
          <Route path="/diagnostico-final" element={<DiagnosticoFinalScreen />} />
          <Route path="/evolucao-pessoal" element={<EvolucaoPessoalScreen />} />
          <Route path="/proxima-trilha" element={<ProximaTrilhaScreen />} />
          <Route path="/mudanca-jornada" element={<MudancaJornadaScreen />} />
          <Route path="/mudar-trilha/confirmar" element={<MudarTrilhaConfirmScreen />} />
          <Route path="/conquista" element={<ConquistaScreen />} />
          <Route path="/cury-digital" element={<CuryDigitalHomeScreen />} />
          <Route path="/cury-digital/chat" element={<CuryDigitalChatScreen />} />
          <Route path="/cury-digital/historico" element={<HistoricoIAScreen />} />
          <Route path="/cury-digital/sugestao" element={<SugestaoTrilhaScreen />} />
          <Route path="/cury-digital/critico" element={<RespostaCriticaScreen />} />
          <Route path="/cury-digital/insights" element={<InsightsIAScreen />} />
          <Route path="/feed" element={<FeedScreen />} />
          <Route path="/enterprise/welcome" element={<EnterpriseWelcomeScreen />} />
          <Route path="/enterprise/privacidade" element={<PrivacyEnterpriseScreen />} />
          <Route path="/enterprise/privacy" element={<PrivacyEnterpriseScreen />} />
          <Route path="/enterprise/convite/:token" element={<EnterpriseInviteAcceptanceScreen />} />
          <Route path="/enterprise/aceite-privacidade" element={<EnterprisePrivacyConsentScreen />} />
          <Route path="/enterprise/cadastro" element={<EnterpriseEmployeeRegisterScreen />} />
          <Route path="/enterprise/boas-vindas" element={<EnterpriseWelcomeJourneyScreen />} />
          <Route path="/enterprise" element={<EnterpriseHomeScreen />} />
          <Route path="/enterprise/cury-digital" element={<EnterpriseCuryDigitalScreen />} />
          <Route path="/enterprise/cury-digital/chat" element={<CuryDigitalChatScreen />} />
          <Route path="/enterprise/cury-digital/historico" element={<HistoricoIAScreen />} />
          <Route path="/enterprise/cury-digital/sugestao" element={<SugestaoTrilhaScreen />} />
          <Route path="/enterprise/cury-digital/critico" element={<RespostaCriticaScreen />} />
          <Route path="/enterprise/cury-digital/insights" element={<InsightsIAScreen />} />
          <Route path="/enterprise/checkin/intro" element={<EnterpriseCheckinIntroScreen />} />
          <Route path="/enterprise/checkin" element={<EnterpriseCheckinScreen />} />
          <Route path="/enterprise/checkin/resultado" element={<EnterpriseCheckinResultScreen />} />
          <Route path="/enterprise/sos-rh" element={<CanalDiretoRHScreen />} />
          <Route path="/enterprise/fale-conosco" element={<ContactUsScreen />} />
          <Route path="/enterprise/materiais" element={<MateriaisScreen />} />
          <Route path="/enterprise/prova-final" element={<ProvaFinalScreen />} />
          <Route path="/enterprise/prova-final/resultado" element={<ResultadoProvaScreen />} />
          <Route path="/enterprise/progresso" element={<ProgressoScreen />} />
          <Route path="/enterprise/sos-rh/mensagem" element={<CanalDiretoMensagemScreen />} />
          <Route path="/enterprise/sos-rh/confirmado" element={<CanalDiretoConfirmacaoScreen />} />
          <Route path="/enterprise/biblioteca" element={<LibraryScreen />} />
          <Route path="/enterprise/trilha" element={<TrilhaScreen />} />
          <Route path="/enterprise/mudanca-jornada" element={<MudancaJornadaScreen />} />
          <Route path="/enterprise/conteudo/leitura" element={<BlogReadingScreen />} />
          <Route path="/enterprise/biblioteca" element={<LibraryScreen />} />
          <Route path="/enterprise/biblioteca/leitor" element={<BookReaderScreen />} />
          <Route path="/enterprise/feed" element={<FeedScreen />} />
          <Route path="/enterprise/feed/leitura" element={<BlogReadingScreen />} />
          <Route path="/enterprise/cury-digital/sugestao" element={<SugestaoTrilhaScreen />} />
          <Route path="/enterprise/conteudo/detalhe" element={<ContentDetailScreen />} />
          <Route path="/enterprise/player/video" element={<VideoShortsScreen />} />
          <Route path="/enterprise/feed/cortes" element={<VideoShortsScreen />} />
          <Route path="/enterprise/feed/video" element={<VideoContentScreen />} />
          <Route path="/enterprise/conteudo/audio" element={<AudioReadingScreen />} />
          <Route path="/enterprise/menu" element={<MenuScreen />} />
          <Route path="/enterprise/jornada" element={<JourneyOverviewScreen />} />
          <Route path="/enterprise/curso" element={<CursoScreen />} />
          <Route path="/enterprise/modulos" element={<ModulosScreen />} />
          <Route path="/enterprise/aula" element={<AulaPlayerScreen />} />
          <Route path="/enterprise/checkout/plano" element={<EnterpriseCheckoutPlanScreen />} />
          <Route path="/enterprise/checkout/dados" element={<EnterpriseCheckoutCompanyDataScreen />} />
          <Route path="/enterprise/checkout/pagamento" element={<EnterpriseCheckoutPaymentScreen />} />
          <Route path="/enterprise/checkout/sucesso" element={<EnterpriseCheckoutSuccessScreen />} />
          <Route path="/enterprise/rh/login" element={<EnterpriseRHLoginScreen />} />
          <Route path="/enterprise/rh/welcome" element={<EnterpriseRHWelcomeScreen />} />
          <Route path="/enterprise/assinatura" element={<SubscriptionScreen />} />
          <Route path="/enterprise/progresso" element={<ProgressoScreen />} />
          <Route path="/enterprise/historico" element={<HistoryScreen />} />
          <Route path="/enterprise/favoritos" element={<FavoritesScreen />} />
          <Route path="/enterprise/downloads" element={<DownloadsScreen />} />
          <Route path="/enterprise/perfil" element={<ProfileScreen />} />
          <Route path="/enterprise/notificacoes" element={<NotificationsScreen />} />
          <Route path="/enterprise/configuracoes" element={<SettingsScreen />} />
          <Route path="/enterprise/configuracoes/leitura" element={<ReadingSettingsScreen />} />
          <Route path="/enterprise/ajuda" element={<HelpCenterScreen />} />
          <Route path="/enterprise/explorar" element={<ExploreScreen />} />
          <Route path="/enterprise/rh/retencao-dados" element={<EnterpriseDataRetentionScreen />} />
          <Route path="/enterprise/rh/compliance" element={<EnterpriseComplianceScreen />} />
          <Route path="/enterprise/rh/politicas" element={<EnterprisePoliciesScreen />} />
          <Route path="/enterprise/rh/unidades" element={<EnterpriseUnitsScreen />} />
          <Route path="/enterprise/rh/multiplos-admins" element={<EnterpriseMultiAdminsScreen />} />
          <Route path="/enterprise/rh/rituais/guiados" element={<EnterpriseGuidedRitualsScreen />} />
          <Route path="/enterprise/rh/central-admin" element={<EnterpriseAdminCenterScreen />} />
          <Route path="/enterprise/rh/billing" element={<EnterpriseBillingScreen />} />


          <Route path="/enterprise/rh" element={<EnterpriseRHAccessScreen />} />
          <Route path="/enterprise/rh/dashboard" element={<EnterpriseRHDashboardScreen />} />
          <Route path="/enterprise/rh/alertas" element={<EnterpriseAlertsScreen />} />
          <Route path="/enterprise/rh/capacidade" element={<EnterpriseCapacityPulseScreen />} />
          <Route path="/enterprise/rh/relatorio" element={<EnterpriseReportScreen />} />
          <Route path="/enterprise/rh/equipe" element={<EnterpriseTeamManagementScreen />} />
          <Route path="/enterprise/rh/departamentos" element={<EnterpriseDepartmentsScreen />} />
          <Route path="/enterprise/rh/equipe/convidar" element={<EnterpriseInviteEmployeesScreen />} />
          <Route path="/enterprise/rh/equipe/importar" element={<EnterpriseImportEmployeesScreen />} />
          <Route path="/enterprise/rh/equipe/licencas" element={<EnterpriseLicensesScreen />} />
          <Route path="/enterprise/rh/equipe/:id" element={<EnterpriseEmployeeAdminScreen />} />
          <Route path="/enterprise/rh/configuracoes" element={<EnterpriseCompanySettingsScreen />} />
          <Route path="/enterprise/rh/dominio" element={<EnterpriseDomainAccessScreen />} />
          <Route path="/enterprise/rh/departamento/:id" element={<EnterpriseDepartmentDetailScreen />} />
          <Route path="/enterprise/rh/plano-acao" element={<EnterpriseActionPlanScreen />} />
          <Route path="/enterprise/rh/integracao" element={<EnterpriseAdminIntegrationScreen />} />
          <Route path="/enterprise/rh/benchmark" element={<EnterpriseBenchmarkScreen />} />
          <Route path="/enterprise/rh/lideranca" element={<EnterpriseLeadershipOverviewScreen />} />
          <Route path="/enterprise/rh/impacto" element={<EnterpriseImpactScreen />} />
          <Route path="/enterprise/rh/mapa-emocional" element={<EnterpriseEmotionalMapScreen />} />
          <Route path="/enterprise/rh/comunicados" element={<EnterpriseLeadershipMessageScreen />} />
          <Route path="/enterprise/rh/insights-ia" element={<EnterpriseAIInsightsScreen />} />
          <Route path="/enterprise/rh/denuncias" element={<EnterpriseRHReportsScreen />} />
          <Route path="/enterprise/rh/denuncias/:id" element={<EnterpriseRHReportDetailScreen />} />
          <Route path="/enterprise/rh/sos" element={<EnterpriseRHReportsScreen />} />
          <Route path="/enterprise/rh/evolucao" element={<EnterpriseJourneyEvolutionScreen />} />
          <Route path="/enterprise/rh/status" element={<EnterpriseStatusHealthScreen />} />
          <Route path="/enterprise/rh/rituais" element={<EnterpriseRitualsScreen />} />
          <Route path="/enterprise/rh/saude-lideranca" element={<EnterpriseLeadershipHealthScreen />} />
          <Route path="/enterprise/rh/navigation" element={<EnterpriseNavigationSystemScreen />} />
          <Route path="/enterprise/rh/desktop" element={<EnterpriseDesktopResponsiveScreen />} />
          <Route path="/enterprise/rh/permissoes" element={<EnterprisePermissionsScreen />} />
          <Route path="/enterprise/rh/auditoria" element={<EnterpriseAuditLogsScreen />} />
          <Route path="/enterprise/rh/integracoes" element={<EnterpriseIntegrationsScreen />} />
          <Route path="/enterprise/rh/empty-states" element={<EnterpriseEmptyStatesScreen />} />
          <Route path="/enterprise/rh/loading-states" element={<EnterpriseLoadingStatesScreen />} />
          <Route path="/enterprise/rh/notificacoes" element={<EnterpriseNotificationsScreen />} />
          <Route path="/enterprise/rh/onboarding" element={<EnterpriseOnboardingScreen />} />
          <Route path="/enterprise/rh/exportacoes" element={<EnterpriseExportsScreen />} />
          <Route path="/enterprise/rh/privacidade" element={<EnterprisePrivacyCenterScreen />} />
          <Route path="/enterprise/rh/suporte" element={<EnterpriseSupportScreen />} />
          <Route path="/enterprise/rh/roadmap" element={<EnterpriseRoadmapScreen />} />
          <Route path="/enterprise/rh/comunicacao-lancamento" element={<EnterpriseLaunchCommunicationScreen />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;