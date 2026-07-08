import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { ReactNode } from "react";
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
import EnterpriseOrgChartScreen from "./pages/EnterpriseOrgChartScreen.tsx";
import EnterpriseOrganizationalDNAScreen from "./pages/EnterpriseOrganizationalDNAScreen.tsx";
import EnterpriseWeeklyInsightsScreen from "./pages/EnterpriseWeeklyInsightsScreen.tsx";
import EnterpriseExecutiveCouncilScreen from "./pages/EnterpriseExecutiveCouncilScreen.tsx";
import EnterpriseMultiAdminsScreen from "./pages/EnterpriseMultiAdminsScreen.tsx";
import EnterpriseGuidedRitualsScreen from "./pages/EnterpriseGuidedRitualsScreen.tsx";
import EnterpriseIntelligentRitualsScreen from "./pages/EnterpriseIntelligentRitualsScreen.tsx";
import EnterpriseOrganizationalScoreScreen from "./pages/EnterpriseOrganizationalScoreScreen.tsx";
import EnterpriseImpactEngineScreen from "./pages/EnterpriseImpactEngineScreen.tsx";
import EnterpriseAdminCenterScreen from "./pages/EnterpriseAdminCenterScreen.tsx";
import EnterpriseBillingScreen from "./pages/EnterpriseBillingScreen.tsx";
import EnterpriseCheckoutPlanScreen from "./pages/EnterpriseCheckoutPlanScreen.tsx";
import EnterpriseCheckoutCompanyDataScreen from "./pages/EnterpriseCheckoutCompanyDataScreen.tsx";
import EnterpriseCheckoutPaymentScreen from "./pages/EnterpriseCheckoutPaymentScreen.tsx";
import EnterpriseCheckoutSuccessScreen from "./pages/EnterpriseCheckoutSuccessScreen.tsx";
import EnterpriseRHLoginScreen from "./pages/EnterpriseRHLoginScreen.tsx";
import EnterpriseRHWelcomeScreen from "./pages/EnterpriseRHWelcomeScreen.tsx";
import EnterpriseSetupScreen from "./pages/EnterpriseSetupScreen.tsx";
import EnterpriseAcceptInvitePage from "./pages/EnterpriseAcceptInvitePage.tsx";
import OnboardingChatScreen from "./pages/OnboardingChatScreen.tsx";
import OnboardingConcluidoScreen from "./pages/OnboardingConcluidoScreen.tsx";
import PulseSettingsScreen from "./pages/PulseSettingsScreen.tsx";
import PlatformAdminDashboardScreen from "./pages/PlatformAdminDashboardScreen.tsx";
import PlatformOrganizationsScreen from "./pages/PlatformOrganizationsScreen.tsx";
import PlatformOrganizationDetailScreen from "./pages/PlatformOrganizationDetailScreen.tsx";
import PlatformSubscriptionsScreen from "./pages/PlatformSubscriptionsScreen.tsx";
import PlatformAIUsageScreen from "./pages/PlatformAIUsageScreen.tsx";
import PlatformAnalyticsScreen from "./pages/PlatformAnalyticsScreen.tsx";
import PlatformSystemHealthScreen from "./pages/PlatformSystemHealthScreen.tsx";
import PlatformBillingScreen from "./pages/PlatformBillingScreen.tsx";
import PlatformSupportScreen from "./pages/PlatformSupportScreen.tsx";
import PlatformAuditScreen from "./pages/PlatformAuditScreen.tsx";
import PlatformSettingsScreen from "./pages/PlatformSettingsScreen.tsx";





import ContactUsScreen from "./components/ContactUsScreen.tsx";
import ReadingSettingsScreen from "./components/settings/ReadingSettingsScreen.tsx";

const queryClient = new QueryClient();

const RH = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRoles={["owner", "rh_admin"]}>{children}</ProtectedRoute>
);
const Ent = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRoles={["owner", "rh_admin", "leader", "employee"]} requireEmployeeProfile>{children}</ProtectedRoute>
);
const Auth = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);
const PlatformAdmin = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRoles={["platform_admin"]}>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Auth><HomeScreen /></Auth>} />
          <Route path="/login" element={<Index />} />
          <Route path="/preloader" element={<PreloaderRoute />} />
          <Route path="/welcome" element={<Auth><WelcomeScreen /></Auth>} />
          <Route path="/chat" element={<Auth><ChatAIScreen /></Auth>} />
          <Route path="/perfil" element={<Auth><ProfileScreen /></Auth>} />
          <Route path="/menu" element={<Auth><MenuScreen /></Auth>} />
          <Route path="/configuracoes" element={<Auth><SettingsScreen /></Auth>} />
          <Route path="/configuracoes/senha" element={<Auth><ChangePasswordScreen /></Auth>} />
          <Route path="/configuracoes/email" element={<Auth><ChangeEmailScreen /></Auth>} />
          <Route path="/configuracoes/idioma" element={<Auth><LanguageScreen /></Auth>} />
          <Route path="/configuracoes/leitura" element={<Auth><ReadingSettingsScreen /></Auth>} />
          <Route path="/configuracoes/qualidade" element={<Auth><VideoQualityScreen /></Auth>} />
          <Route path="/configuracoes/privacidade" element={<Auth><PrivacyScreen /></Auth>} />
          <Route path="/configuracoes/termos" element={<Auth><TermsScreen /></Auth>} />
          <Route path="/configuracoes/politica" element={<Auth><PolicyScreen /></Auth>} />
          <Route path="/ajuda" element={<Auth><HelpCenterScreen /></Auth>} />
          <Route path="/fale-conosco" element={<Auth><ContactUsScreen /></Auth>} />
          <Route path="/notificacoes" element={<Auth><NotificationsScreen /></Auth>} />
          <Route path="/historico" element={<Auth><HistoryScreen /></Auth>} />
          <Route path="/downloads" element={<Auth><DownloadsScreen /></Auth>} />
          <Route path="/favoritos" element={<Auth><FavoritesScreen /></Auth>} />
          <Route path="/assinatura" element={<Auth><SubscriptionScreen /></Auth>} />
          <Route path="/sobre-expert" element={<AboutExpertScreen />} />
          <Route path="/conteudo/video" element={<Auth><VideoContentScreen /></Auth>} />
          <Route path="/feed/video" element={<Auth><VideoContentScreen /></Auth>} />
          <Route path="/conteudo/audio" element={<Auth><AudioReadingScreen /></Auth>} />
          <Route path="/player/audio" element={<Auth><AudioPlayerScreen /></Auth>} />
          <Route path="/conteudo/detalhe" element={<Auth><ContentDetailScreen /></Auth>} />
          <Route path="/player/podcast" element={<Auth><PodcastPlayerScreen /></Auth>} />
          <Route path="/player/video" element={<Auth><VideoShortsScreen /></Auth>} />
          <Route path="/feed/cortes" element={<Auth><VideoShortsScreen /></Auth>} />
          <Route path="/player/audiolivro" element={<Auth><AudiobookScreen /></Auth>} />
          <Route path="/feed/categorias" element={<Auth><FeedCategoriesScreen /></Auth>} />
          <Route path="/biblioteca/salvos" element={<Auth><SavedContentScreen /></Auth>} />
          <Route path="/biblioteca/continuar" element={<Auth><ContinueWatchingScreen /></Auth>} />
          <Route path="/campanhas" element={<Auth><CampaignsScreen /></Auth>} />
          <Route path="/convidado" element={<Auth><GuestProfileScreen /></Auth>} />
          <Route path="/convidado/:slug" element={<Auth><GuestProfileScreen /></Auth>} />
          <Route path="/conteudo/leitura" element={<Auth><BlogReadingScreen /></Auth>} />
          <Route path="/feed/leitura" element={<Auth><BlogReadingScreen /></Auth>} />
          <Route path="/explorar" element={<Auth><ExploreScreen /></Auth>} />
          <Route path="/biblioteca" element={<Auth><LibraryScreen /></Auth>} />
          <Route path="/biblioteca/desbloqueado" element={<Auth><BookUnlockedScreen /></Auth>} />
          <Route path="/biblioteca/bloqueado" element={<Auth><BookLockedScreen /></Auth>} />
          <Route path="/biblioteca/leitor" element={<Auth><BookReaderScreen /></Auth>} />
          <Route path="/biblioteca/temas" element={<Auth><ThemedLibraryScreen /></Auth>} />
          <Route path="/biblioteca/detalhe" element={<Auth><BookDetailScreen /></Auth>} />
          <Route path="/biblioteca/nova-liberacao" element={<Auth><NewReleaseScreen /></Auth>} />
          <Route path="/biblioteca/liberados-mes" element={<Auth><MonthlyBooksScreen /></Auth>} />
          <Route path="/biblioteca/minha-leitura" element={<Auth><MyReadingScreen /></Auth>} />
          <Route path="/biblioteca/progresso-leitura" element={<Auth><ReadingProgressScreen /></Auth>} />
          <Route path="/biblioteca/capitulos" element={<Auth><BookChaptersScreen /></Auth>} />
          <Route path="/trilha" element={<Auth><TrilhaScreen /></Auth>} />
          <Route path="/jornada" element={<Auth><JourneyOverviewScreen /></Auth>} />
          <Route path="/diagnostico" element={<Auth><DiagnosticoScreen /></Auth>} />
          <Route path="/curso" element={<Auth><CursoScreen /></Auth>} />
          <Route path="/curso/1" element={<Auth><CursoScreen /></Auth>} />
          <Route path="/modulos" element={<Auth><ModulosScreen /></Auth>} />
          <Route path="/aula" element={<Auth><AulaPlayerScreen /></Auth>} />
          <Route path="/materiais" element={<Auth><MateriaisScreen /></Auth>} />
          <Route path="/progresso" element={<Auth><ProgressoScreen /></Auth>} />
          <Route path="/prova-final" element={<Auth><ProvaFinalScreen /></Auth>} />
          <Route path="/prova-final/resultado" element={<Auth><ResultadoProvaScreen /></Auth>} />
          <Route path="/curso-desbloqueado" element={<Auth><CursoDesbloqueadoScreen /></Auth>} />
          <Route path="/diagnostico-final" element={<Auth><DiagnosticoFinalScreen /></Auth>} />
          <Route path="/evolucao-pessoal" element={<Auth><EvolucaoPessoalScreen /></Auth>} />
          <Route path="/proxima-trilha" element={<Auth><ProximaTrilhaScreen /></Auth>} />
          <Route path="/mudanca-jornada" element={<Auth><MudancaJornadaScreen /></Auth>} />
          <Route path="/mudar-trilha/confirmar" element={<Auth><MudarTrilhaConfirmScreen /></Auth>} />
          <Route path="/conquista" element={<Auth><ConquistaScreen /></Auth>} />
          <Route path="/cury-digital" element={<Auth><CuryDigitalHomeScreen /></Auth>} />
          <Route path="/cury-digital/chat" element={<Auth><CuryDigitalChatScreen /></Auth>} />
          <Route path="/cury-digital/historico" element={<Auth><HistoricoIAScreen /></Auth>} />
          <Route path="/cury-digital/sugestao" element={<Auth><SugestaoTrilhaScreen /></Auth>} />
          <Route path="/cury-digital/critico" element={<Auth><RespostaCriticaScreen /></Auth>} />
          <Route path="/cury-digital/insights" element={<Auth><InsightsIAScreen /></Auth>} />
          <Route path="/feed" element={<Auth><FeedScreen /></Auth>} />
          <Route path="/enterprise/welcome" element={<EnterpriseWelcomeScreen />} />
          <Route path="/enterprise/privacidade" element={<PrivacyEnterpriseScreen />} />
          <Route path="/enterprise/privacy" element={<PrivacyEnterpriseScreen />} />
          <Route path="/enterprise/convite/:token" element={<EnterpriseAcceptInvitePage />} />
          <Route path="/enterprise/convite" element={<EnterpriseInviteAcceptanceScreen />} />
          <Route path="/enterprise/setup" element={<Auth><EnterpriseSetupScreen /></Auth>} />
          <Route path="/enterprise/aceite-privacidade" element={<EnterprisePrivacyConsentScreen />} />
          <Route path="/onboarding" element={<Auth><OnboardingChatScreen /></Auth>} />
          <Route path="/onboarding/concluido" element={<Auth><OnboardingConcluidoScreen /></Auth>} />
          <Route path="/enterprise/pulse/configuracoes" element={<Ent><PulseSettingsScreen /></Ent>} />
          <Route path="/enterprise/cadastro" element={<EnterpriseEmployeeRegisterScreen />} />
          <Route path="/enterprise/boas-vindas" element={<EnterpriseWelcomeJourneyScreen />} />
          <Route path="/enterprise" element={<Ent><EnterpriseHomeScreen /></Ent>} />
          <Route path="/enterprise/cury-digital" element={<Ent><EnterpriseCuryDigitalScreen /></Ent>} />
          <Route path="/enterprise/cury-digital/chat" element={<Ent><CuryDigitalChatScreen /></Ent>} />
          <Route path="/enterprise/cury-digital/historico" element={<Ent><HistoricoIAScreen /></Ent>} />
          <Route path="/enterprise/cury-digital/sugestao" element={<Ent><SugestaoTrilhaScreen /></Ent>} />
          <Route path="/enterprise/cury-digital/critico" element={<Ent><RespostaCriticaScreen /></Ent>} />
          <Route path="/enterprise/cury-digital/insights" element={<Ent><InsightsIAScreen /></Ent>} />
          <Route path="/enterprise/checkin/intro" element={<Ent><EnterpriseCheckinIntroScreen /></Ent>} />
          <Route path="/enterprise/checkin" element={<Ent><EnterpriseCheckinScreen /></Ent>} />
          <Route path="/enterprise/checkin/resultado" element={<Ent><EnterpriseCheckinResultScreen /></Ent>} />
          <Route path="/enterprise/sos-rh" element={<Ent><CanalDiretoRHScreen /></Ent>} />
          <Route path="/enterprise/fale-conosco" element={<Ent><ContactUsScreen /></Ent>} />
          <Route path="/enterprise/materiais" element={<Ent><MateriaisScreen /></Ent>} />
          <Route path="/enterprise/prova-final" element={<Ent><ProvaFinalScreen /></Ent>} />
          <Route path="/enterprise/prova-final/resultado" element={<Ent><ResultadoProvaScreen /></Ent>} />
          <Route path="/enterprise/progresso" element={<Ent><ProgressoScreen /></Ent>} />
          <Route path="/enterprise/sos-rh/mensagem" element={<Ent><CanalDiretoMensagemScreen /></Ent>} />
          <Route path="/enterprise/sos-rh/confirmado" element={<Ent><CanalDiretoConfirmacaoScreen /></Ent>} />
          <Route path="/enterprise/biblioteca" element={<Ent><LibraryScreen /></Ent>} />
          <Route path="/enterprise/trilha" element={<Ent><TrilhaScreen /></Ent>} />
          <Route path="/enterprise/mudanca-jornada" element={<Ent><MudancaJornadaScreen /></Ent>} />
          <Route path="/enterprise/conteudo/leitura" element={<Ent><BlogReadingScreen /></Ent>} />
          <Route path="/enterprise/biblioteca" element={<Ent><LibraryScreen /></Ent>} />
          <Route path="/enterprise/biblioteca/leitor" element={<Ent><BookReaderScreen /></Ent>} />
          <Route path="/enterprise/feed" element={<Ent><FeedScreen /></Ent>} />
          <Route path="/enterprise/feed/leitura" element={<Ent><BlogReadingScreen /></Ent>} />
          <Route path="/enterprise/cury-digital/sugestao" element={<Ent><SugestaoTrilhaScreen /></Ent>} />
          <Route path="/enterprise/conteudo/detalhe" element={<Ent><ContentDetailScreen /></Ent>} />
          <Route path="/enterprise/player/video" element={<Ent><VideoShortsScreen /></Ent>} />
          <Route path="/enterprise/feed/cortes" element={<Ent><VideoShortsScreen /></Ent>} />
          <Route path="/enterprise/feed/video" element={<Ent><VideoContentScreen /></Ent>} />
          <Route path="/enterprise/conteudo/audio" element={<Ent><AudioReadingScreen /></Ent>} />
          <Route path="/enterprise/menu" element={<Ent><MenuScreen /></Ent>} />
          <Route path="/enterprise/jornada" element={<Ent><JourneyOverviewScreen /></Ent>} />
          <Route path="/enterprise/curso" element={<Ent><CursoScreen /></Ent>} />
          <Route path="/enterprise/modulos" element={<Ent><ModulosScreen /></Ent>} />
          <Route path="/enterprise/aula" element={<Ent><AulaPlayerScreen /></Ent>} />
          <Route path="/enterprise/checkout/plano" element={<EnterpriseCheckoutPlanScreen />} />
          <Route path="/enterprise/checkout/dados" element={<EnterpriseCheckoutCompanyDataScreen />} />
          <Route path="/enterprise/checkout/pagamento" element={<EnterpriseCheckoutPaymentScreen />} />
          <Route path="/enterprise/checkout/sucesso" element={<EnterpriseCheckoutSuccessScreen />} />
          <Route path="/enterprise/rh/login" element={<EnterpriseRHLoginScreen />} />
          <Route path="/enterprise/rh/welcome" element={<RH><EnterpriseRHWelcomeScreen /></RH>} />
          <Route path="/enterprise/assinatura" element={<Ent><SubscriptionScreen /></Ent>} />
          <Route path="/enterprise/progresso" element={<Ent><ProgressoScreen /></Ent>} />
          <Route path="/enterprise/historico" element={<Ent><HistoryScreen /></Ent>} />
          <Route path="/enterprise/favoritos" element={<Ent><FavoritesScreen /></Ent>} />
          <Route path="/enterprise/downloads" element={<Ent><DownloadsScreen /></Ent>} />
          <Route path="/enterprise/perfil" element={<Ent><ProfileScreen /></Ent>} />
          <Route path="/enterprise/notificacoes" element={<Ent><NotificationsScreen /></Ent>} />
          <Route path="/enterprise/configuracoes" element={<Ent><SettingsScreen /></Ent>} />
          <Route path="/enterprise/configuracoes/leitura" element={<Ent><ReadingSettingsScreen /></Ent>} />
          <Route path="/enterprise/ajuda" element={<Ent><HelpCenterScreen /></Ent>} />
          <Route path="/enterprise/explorar" element={<Ent><ExploreScreen /></Ent>} />
          <Route path="/enterprise/rh/retencao-dados" element={<RH><EnterpriseDataRetentionScreen /></RH>} />
          <Route path="/enterprise/rh/compliance" element={<RH><EnterpriseComplianceScreen /></RH>} />
          <Route path="/enterprise/rh/politicas" element={<RH><EnterprisePoliciesScreen /></RH>} />
          <Route path="/enterprise/rh/unidades" element={<RH><EnterpriseUnitsScreen /></RH>} />
          <Route path="/enterprise/rh/multiplos-admins" element={<RH><EnterpriseMultiAdminsScreen /></RH>} />
          <Route path="/enterprise/rh/rituais/guiados" element={<RH><EnterpriseGuidedRitualsScreen /></RH>} />
          <Route path="/enterprise/rh/central-admin" element={<RH><EnterpriseAdminCenterScreen /></RH>} />
          <Route path="/enterprise/rh/billing" element={<RH><EnterpriseBillingScreen /></RH>} />


          <Route path="/enterprise/rh" element={<RH><EnterpriseRHAccessScreen /></RH>} />
          <Route path="/enterprise/rh/dashboard" element={<RH><EnterpriseRHDashboardScreen /></RH>} />
          <Route path="/enterprise/rh/alertas" element={<RH><EnterpriseAlertsScreen /></RH>} />
          <Route path="/enterprise/rh/capacidade" element={<RH><EnterpriseCapacityPulseScreen /></RH>} />
          <Route path="/enterprise/rh/relatorio" element={<RH><EnterpriseReportScreen /></RH>} />
          <Route path="/enterprise/rh/equipe" element={<RH><EnterpriseTeamManagementScreen /></RH>} />
          <Route path="/enterprise/rh/departamentos" element={<RH><EnterpriseDepartmentsScreen /></RH>} />
          <Route path="/enterprise/rh/equipe/convidar" element={<RH><EnterpriseInviteEmployeesScreen /></RH>} />
          <Route path="/enterprise/rh/equipe/importar" element={<RH><EnterpriseImportEmployeesScreen /></RH>} />
          <Route path="/enterprise/rh/equipe/licencas" element={<RH><EnterpriseLicensesScreen /></RH>} />
          <Route path="/enterprise/rh/equipe/:id" element={<RH><EnterpriseEmployeeAdminScreen /></RH>} />
          <Route path="/enterprise/rh/organograma" element={<RH><EnterpriseOrgChartScreen /></RH>} />
          <Route path="/enterprise/rh/dna-organizacional" element={<RH><EnterpriseOrganizationalDNAScreen /></RH>} />
          <Route path="/enterprise/rh/insights-semanais" element={<RH><EnterpriseWeeklyInsightsScreen /></RH>} />
          <Route path="/enterprise/rh/conselho-executivo" element={<RH><EnterpriseExecutiveCouncilScreen /></RH>} />
          <Route path="/enterprise/rh/configuracoes" element={<RH><EnterpriseCompanySettingsScreen /></RH>} />
          <Route path="/enterprise/rh/dominio" element={<RH><EnterpriseDomainAccessScreen /></RH>} />
          <Route path="/enterprise/rh/departamento/:id" element={<RH><EnterpriseDepartmentDetailScreen /></RH>} />
          <Route path="/enterprise/rh/plano-acao" element={<RH><EnterpriseActionPlanScreen /></RH>} />
          <Route path="/enterprise/rh/integracao" element={<RH><EnterpriseAdminIntegrationScreen /></RH>} />
          <Route path="/enterprise/rh/benchmark" element={<RH><EnterpriseBenchmarkScreen /></RH>} />
          <Route path="/enterprise/rh/lideranca" element={<RH><EnterpriseLeadershipOverviewScreen /></RH>} />
          <Route path="/enterprise/rh/impacto" element={<RH><EnterpriseImpactEngineScreen /></RH>} />
          <Route path="/enterprise/rh/mapa-emocional" element={<RH><EnterpriseEmotionalMapScreen /></RH>} />
          <Route path="/enterprise/rh/comunicados" element={<RH><EnterpriseLeadershipMessageScreen /></RH>} />
          <Route path="/enterprise/rh/insights-ia" element={<RH><EnterpriseAIInsightsScreen /></RH>} />
          <Route path="/enterprise/rh/denuncias" element={<RH><EnterpriseRHReportsScreen /></RH>} />
          <Route path="/enterprise/rh/denuncias/:id" element={<RH><EnterpriseRHReportDetailScreen /></RH>} />
          <Route path="/enterprise/rh/sos" element={<RH><EnterpriseRHReportsScreen /></RH>} />
          <Route path="/enterprise/rh/evolucao" element={<RH><EnterpriseJourneyEvolutionScreen /></RH>} />
          <Route path="/enterprise/rh/status" element={<RH><EnterpriseStatusHealthScreen /></RH>} />
          <Route path="/enterprise/rh/rituais" element={<RH><EnterpriseRitualsScreen /></RH>} />
          <Route path="/enterprise/rh/rituais-inteligentes" element={<RH><EnterpriseIntelligentRitualsScreen /></RH>} />
          <Route path="/enterprise/rh/score-organizacional" element={<RH><EnterpriseOrganizationalScoreScreen /></RH>} />
          <Route path="/enterprise/rituais" element={<Ent><EnterpriseRitualsScreen /></Ent>} />
          <Route path="/enterprise/rh/saude-lideranca" element={<RH><EnterpriseLeadershipHealthScreen /></RH>} />
          <Route path="/enterprise/rh/navigation" element={<RH><EnterpriseNavigationSystemScreen /></RH>} />
          <Route path="/enterprise/rh/desktop" element={<RH><EnterpriseDesktopResponsiveScreen /></RH>} />
          <Route path="/enterprise/rh/permissoes" element={<RH><EnterprisePermissionsScreen /></RH>} />
          <Route path="/enterprise/rh/auditoria" element={<RH><EnterpriseAuditLogsScreen /></RH>} />
          <Route path="/enterprise/rh/integracoes" element={<RH><EnterpriseIntegrationsScreen /></RH>} />
          <Route path="/enterprise/rh/empty-states" element={<RH><EnterpriseEmptyStatesScreen /></RH>} />
          <Route path="/enterprise/rh/loading-states" element={<RH><EnterpriseLoadingStatesScreen /></RH>} />
          <Route path="/enterprise/rh/notificacoes" element={<RH><EnterpriseNotificationsScreen /></RH>} />
          <Route path="/enterprise/rh/onboarding" element={<RH><EnterpriseOnboardingScreen /></RH>} />
          <Route path="/enterprise/rh/exportacoes" element={<RH><EnterpriseExportsScreen /></RH>} />
          <Route path="/enterprise/rh/privacidade" element={<RH><EnterprisePrivacyCenterScreen /></RH>} />
          <Route path="/enterprise/rh/suporte" element={<RH><EnterpriseSupportScreen /></RH>} />
          <Route path="/enterprise/rh/roadmap" element={<RH><EnterpriseRoadmapScreen /></RH>} />
          <Route path="/enterprise/rh/comunicacao-lancamento" element={<RH><EnterpriseLaunchCommunicationScreen /></RH>} />

          {/* Super Admin SaaS */}
          <Route path="/admin" element={<PlatformAdmin><PlatformAdminDashboardScreen /></PlatformAdmin>} />
          <Route path="/admin/dashboard" element={<PlatformAdmin><PlatformAdminDashboardScreen /></PlatformAdmin>} />
          <Route path="/admin/organizations" element={<PlatformAdmin><PlatformOrganizationsScreen /></PlatformAdmin>} />
          <Route path="/admin/organizations/:id" element={<PlatformAdmin><PlatformOrganizationDetailScreen /></PlatformAdmin>} />
          <Route path="/admin/subscriptions" element={<PlatformAdmin><PlatformSubscriptionsScreen /></PlatformAdmin>} />
          <Route path="/admin/billing" element={<PlatformAdmin><PlatformBillingScreen /></PlatformAdmin>} />
          <Route path="/admin/ai-usage" element={<PlatformAdmin><PlatformAIUsageScreen /></PlatformAdmin>} />
          <Route path="/admin/analytics" element={<PlatformAdmin><PlatformAnalyticsScreen /></PlatformAdmin>} />
          <Route path="/admin/system" element={<PlatformAdmin><PlatformSystemHealthScreen /></PlatformAdmin>} />
          <Route path="/admin/support" element={<PlatformAdmin><PlatformSupportScreen /></PlatformAdmin>} />
          <Route path="/admin/audit" element={<PlatformAdmin><PlatformAuditScreen /></PlatformAdmin>} />

          <Route path="*" element={<Auth><NotFound /></Auth>} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
