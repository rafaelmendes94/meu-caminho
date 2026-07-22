import { lazy, Suspense, useEffect, useState, useTransition } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, getDefaultAuthenticatedPath, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrgBrandingProvider from "@/components/OrgBrandingProvider";
import OrgLocaleProvider from "@/components/OrgLocaleProvider";
import OrganizationWorkScheduleProvider from "@/components/OrganizationWorkScheduleProvider";
import type { ReactNode } from "react";
const PlatformSearchScreen = lazy(() => import("./pages/PlatformSearchScreen"));
const PlatformDocsScreen = lazy(() => import("./pages/PlatformDocsScreen"));
const PlatformAccountScreen = lazy(() => import("./pages/PlatformAccountScreen"));
const PlatformSecurityScreen = lazy(() => import("./pages/PlatformSecurityScreen"));
const EnterpriseCuryDigitalScreen = lazy(() => import("./components/EnterpriseCuryDigitalScreen.tsx"));
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
const EnterpriseWelcomeScreen = lazy(() => import("./components/EnterpriseWelcomeScreen.tsx"));
import PrivacyEnterpriseScreen from "./components/PrivacyEnterpriseScreen.tsx";
const EnterpriseHomeScreen = lazy(() => import("./components/EnterpriseHomeScreen.tsx"));
const EnterpriseCheckinIntroScreen = lazy(() => import("./components/EnterpriseCheckinIntroScreen.tsx"));
const EnterpriseCheckinScreen = lazy(() => import("./components/EnterpriseCheckinScreen.tsx"));
const EnterpriseCheckinResultScreen = lazy(() => import("./components/EnterpriseCheckinResultScreen.tsx"));
const EnterpriseLibraryScreen = lazy(() => import("./components/EnterpriseLibraryScreen.tsx"));
const EnterpriseRHDashboardScreen = lazy(() => import("./components/EnterpriseRHDashboardScreen.tsx"));
const EnterpriseCapacityPulseScreen = lazy(() => import("./components/EnterpriseCapacityPulseScreen.tsx"));
const EnterpriseAlertsScreen = lazy(() => import("./components/EnterpriseAlertsScreen.tsx"));
const EnterpriseReportScreen = lazy(() => import("./components/EnterpriseReportScreen.tsx"));
const EnterpriseRHAccessScreen = lazy(() => import("./components/EnterpriseRHAccessScreen.tsx"));
const EnterpriseTeamManagementScreen = lazy(() => import("./components/EnterpriseTeamManagementScreen.tsx"));
const EnterpriseCompanySettingsScreen = lazy(() => import("./components/EnterpriseCompanySettingsScreen.tsx"));
const EnterpriseSettingsScreen = lazy(() => import("./pages/EnterpriseSettingsScreen.tsx"));
const EnterpriseDepartmentDetailScreen = lazy(() => import("./components/EnterpriseDepartmentDetailScreen.tsx"));
const EnterpriseActionPlanScreen = lazy(() => import("./components/EnterpriseActionPlanScreen.tsx"));
const EnterpriseAdminIntegrationScreen = lazy(() => import("./components/EnterpriseAdminIntegrationScreen.tsx"));
const EnterpriseBenchmarkScreen = lazy(() => import("./components/EnterpriseBenchmarkScreen.tsx"));
const EnterpriseLeadershipOverviewScreen = lazy(() => import("./components/EnterpriseLeadershipOverviewScreen.tsx"));
const EnterpriseEmotionalMapScreen = lazy(() => import("./components/EnterpriseEmotionalMapScreen.tsx"));
const EnterpriseLeadershipMessageScreen = lazy(() => import("./components/EnterpriseLeadershipMessageScreen.tsx"));
const EnterpriseJourneyEvolutionScreen = lazy(() => import("./components/EnterpriseJourneyEvolutionScreen.tsx"));
const EnterpriseLeadershipHealthScreen = lazy(() => import("./components/EnterpriseLeadershipHealthScreen.tsx"));
const EnterprisePermissionsScreen = lazy(() => import("./components/EnterprisePermissionsScreen.tsx"));
const EnterpriseIntegrationsScreen = lazy(() => import("./components/EnterpriseIntegrationsScreen.tsx"));
const EnterpriseNotificationsScreen = lazy(() => import("./components/EnterpriseNotificationsScreen.tsx"));
const EnterpriseExportsScreen = lazy(() => import("./components/EnterpriseExportsScreen.tsx"));
const EnterprisePrivacyCenterScreen = lazy(() => import("./components/EnterprisePrivacyCenterScreen.tsx"));
const MyPrivacyScreen = lazy(() => import("./pages/MyPrivacyScreen.tsx"));
const EnterpriseOnboardingScreen = lazy(() => import("./components/EnterpriseOnboardingScreen.tsx"));
const EnterpriseEmptyStatesScreen = lazy(() => import("./components/EnterpriseEmptyStatesScreen.tsx"));
const EnterpriseLoadingStatesScreen = lazy(() => import("./components/EnterpriseLoadingStatesScreen.tsx"));
const EnterpriseNavigationSystemScreen = lazy(() => import("./components/EnterpriseNavigationSystemScreen.tsx"));
const EnterpriseDesktopResponsiveScreen = lazy(() => import("./components/EnterpriseDesktopResponsiveScreen.tsx"));
const EnterpriseSupportScreen = lazy(() => import("./pages/EnterpriseSupportScreen.tsx"));
const EnterpriseRoadmapScreen = lazy(() => import("./pages/EnterpriseRoadmapScreen.tsx"));
const EnterpriseLaunchCommunicationScreen = lazy(() => import("./pages/EnterpriseLaunchCommunicationScreen.tsx"));
const EnterpriseStatusHealthScreen = lazy(() => import("./components/EnterpriseStatusHealthScreen.tsx"));
const EnterpriseRHReportsScreen = lazy(() => import("./components/EnterpriseRHReportsScreen.tsx"));
const EnterpriseRHReportDetailScreen = lazy(() => import("./components/EnterpriseRHReportDetailScreen.tsx"));
const EnterpriseInviteEmployeesScreen = lazy(() => import("./components/EnterpriseInviteEmployeesScreen.tsx"));
const EnterpriseInviteAcceptanceScreen = lazy(() => import("./components/EnterpriseInviteAcceptanceScreen.tsx"));
const EnterpriseDepartmentsScreen = lazy(() => import("./components/EnterpriseDepartmentsScreen.tsx"));
const EnterprisePrivacyConsentScreen = lazy(() => import("./components/EnterprisePrivacyConsentScreen.tsx"));
const EnterpriseEmployeeRegisterScreen = lazy(() => import("./components/EnterpriseEmployeeRegisterScreen.tsx"));
const EnterpriseWelcomeJourneyScreen = lazy(() => import("./components/EnterpriseWelcomeJourneyScreen.tsx"));
const EnterpriseImportEmployeesScreen = lazy(() => import("./components/EnterpriseImportEmployeesScreen.tsx"));
const EnterpriseLicensesScreen = lazy(() => import("./components/EnterpriseLicensesScreen.tsx"));
const EnterpriseEmployeeAdminScreen = lazy(() => import("./components/EnterpriseEmployeeAdminScreen.tsx"));
const EnterpriseAuditLogsScreen = lazy(() => import("./components/EnterpriseAuditLogsScreen.tsx"));
const EnterpriseDomainAccessScreen = lazy(() => import("./components/EnterpriseDomainAccessScreen.tsx"));
const EnterpriseDataRetentionScreen = lazy(() => import("./pages/EnterpriseDataRetentionScreen.tsx"));
const EnterpriseComplianceScreen = lazy(() => import("./pages/EnterpriseComplianceScreen.tsx"));
const EnterprisePoliciesScreen = lazy(() => import("./pages/EnterprisePoliciesScreen.tsx"));
const EnterpriseUnitsScreen = lazy(() => import("./pages/EnterpriseUnitsScreen.tsx"));
const EnterpriseJobPositionsScreen = lazy(() => import("./pages/EnterpriseJobPositionsScreen.tsx"));
const EnterpriseOrgChartScreen = lazy(() => import("./pages/EnterpriseOrgChartScreen.tsx"));
const EnterpriseOrganizationalDNAScreen = lazy(() => import("./pages/EnterpriseOrganizationalDNAScreen.tsx"));
const EnterpriseWeeklyInsightsScreen = lazy(() => import("./pages/EnterpriseWeeklyInsightsScreen.tsx"));
const EnterpriseExecutiveCouncilScreen = lazy(() => import("./pages/EnterpriseExecutiveCouncilScreen.tsx"));
const EnterpriseMultiAdminsScreen = lazy(() => import("./pages/EnterpriseMultiAdminsScreen.tsx"));
const EnterpriseIntelligentRitualsScreen = lazy(() => import("./pages/EnterpriseIntelligentRitualsScreen.tsx"));
const EnterpriseOrganizationalScoreScreen = lazy(() => import("./pages/EnterpriseOrganizationalScoreScreen.tsx"));
const EnterpriseImpactEngineScreen = lazy(() => import("./pages/EnterpriseImpactEngineScreen.tsx"));
const EnterpriseRitualParticipationsScreen = lazy(() => import("./pages/EnterpriseRitualParticipationsScreen.tsx"));
const EnterpriseAdminCenterScreen = lazy(() => import("./pages/EnterpriseAdminCenterScreen.tsx"));
const EnterpriseBillingScreen = lazy(() => import("./pages/EnterpriseBillingScreen.tsx"));
const EnterpriseCheckoutPlanScreen = lazy(() => import("./pages/EnterpriseCheckoutPlanScreen.tsx"));
const EnterpriseCheckoutCompanyDataScreen = lazy(() => import("./pages/EnterpriseCheckoutCompanyDataScreen.tsx"));
const EnterpriseCheckoutPaymentScreen = lazy(() => import("./pages/EnterpriseCheckoutPaymentScreen.tsx"));
const EnterpriseCheckoutSuccessScreen = lazy(() => import("./pages/EnterpriseCheckoutSuccessScreen.tsx"));
const EnterpriseRHLoginScreen = lazy(() => import("./pages/EnterpriseRHLoginScreen.tsx"));
const EnterpriseRHWelcomeScreen = lazy(() => import("./pages/EnterpriseRHWelcomeScreen.tsx"));
const EnterpriseSetupScreen = lazy(() => import("./pages/EnterpriseSetupScreen.tsx"));
const EnterpriseAcceptInvitePage = lazy(() => import("./pages/EnterpriseAcceptInvitePage.tsx"));
const OnboardingChatScreen = lazy(() => import("./pages/OnboardingChatScreen.tsx"));
const OnboardingConcluidoScreen = lazy(() => import("./pages/OnboardingConcluidoScreen.tsx"));
const PulseSettingsScreen = lazy(() => import("./pages/PulseSettingsScreen.tsx"));
const PlatformAdminDashboardScreen = lazy(() => import("./pages/PlatformAdminDashboardScreen.tsx"));
const PlatformOrganizationsScreen = lazy(() => import("./pages/PlatformOrganizationsScreen.tsx"));
const PlatformOwnersScreen = lazy(() => import("./pages/PlatformOwnersScreen.tsx"));
const PlatformOrganizationDetailScreen = lazy(() => import("./pages/PlatformOrganizationDetailScreen.tsx"));
const PlatformSubscriptionsScreen = lazy(() => import("./pages/PlatformSubscriptionsScreen.tsx"));
const PlatformPlansScreen = lazy(() => import("./pages/PlatformPlansScreen.tsx"));
const PlatformAIUsageScreen = lazy(() => import("./pages/PlatformAIUsageScreen.tsx"));
const PlatformAIProviderScreen = lazy(() => import("./pages/PlatformAIProviderScreen.tsx"));
const PlatformAnalyticsScreen = lazy(() => import("./pages/PlatformAnalyticsScreen.tsx"));
const PlatformSystemHealthScreen = lazy(() => import("./pages/PlatformSystemHealthScreen.tsx"));
const PlatformBackupRecoveryScreen = lazy(() => import("./pages/PlatformBackupRecoveryScreen.tsx"));
const PlatformPerformanceCenterScreen = lazy(() => import("./pages/PlatformPerformanceCenterScreen.tsx"));
const PlatformQACenterScreen = lazy(() => import("./pages/PlatformQACenterScreen.tsx"));
const PlatformBillingScreen = lazy(() => import("./pages/PlatformBillingScreen.tsx"));
const PlatformSupportScreen = lazy(() => import("./pages/PlatformSupportScreen.tsx"));
const PlatformAuditScreen = lazy(() => import("./pages/PlatformAuditScreen.tsx"));
const PlatformSettingsScreen = lazy(() => import("./pages/PlatformSettingsScreen.tsx"));
const PlatformContentDashboardScreen = lazy(() => import("./pages/PlatformContentDashboardScreen.tsx"));
const PlatformContentAuthorsScreen = lazy(() => import("./pages/PlatformContentAuthorsScreen.tsx"));
const PlatformContentCategoriesScreen = lazy(() => import("./pages/PlatformContentCategoriesScreen.tsx"));
const PlatformContentTagsScreen = lazy(() => import("./pages/PlatformContentTagsScreen.tsx"));
const PlatformContentBooksScreen = lazy(() => import("./pages/PlatformContentItemsListScreen.tsx"));
const PlatformContentCoursesScreen = lazy(() => import("./pages/PlatformContentCoursesScreen.tsx"));
const PlatformContentCourseBuilderScreen = lazy(() => import("./pages/PlatformContentCourseBuilderScreen.tsx"));
const PlatformContentTracksScreen = lazy(() => import("./pages/PlatformContentTracksScreen.tsx"));
const PlatformContentTrackBuilderScreen = lazy(() => import("./pages/PlatformContentTrackBuilderScreen.tsx"));
const PlatformContentPodcastsScreen = lazy(() => import("./pages/PlatformContentPodcastsScreen.tsx"));
const PlatformContentVideosScreen = lazy(() => import("./pages/PlatformContentVideosScreen.tsx"));
const PlatformContentAudiosScreen = lazy(() => import("./pages/PlatformContentAudiosScreen.tsx"));
const PlatformContentMaterialsScreen = lazy(() => import("./pages/PlatformContentMaterialsScreen.tsx"));
const PlatformContentCollectionsScreen = lazy(() => import("./pages/PlatformContentCollectionsScreen.tsx"));
const PlatformContentCollectionBuilderScreen = lazy(() => import("./pages/PlatformContentCollectionBuilderScreen.tsx"));
const PlatformContentLibraryScreen = lazy(() => import("./pages/PlatformContentLibraryScreen.tsx"));
const PlatformCMSHubScreen = lazy(() => import("./pages/PlatformCMSHubScreen.tsx"));
const PlatformExecutiveCouncilConfigScreen = lazy(() => import("./pages/PlatformExecutiveCouncilConfigScreen.tsx"));
const PlatformOrganizationalDNAConfigScreen = lazy(() => import("./pages/PlatformOrganizationalDNAConfigScreen.tsx"));
const PlatformWeeklyInsightsConfigScreen = lazy(() => import("./pages/PlatformWeeklyInsightsConfigScreen.tsx"));
const PlatformActionPlanConfigScreen = lazy(() => import("./pages/PlatformActionPlanConfigScreen.tsx"));
const PlatformIntelligentRitualConfigScreen = lazy(() => import("./pages/PlatformIntelligentRitualConfigScreen.tsx"));
const PlatformRecommendationEngineConfigScreen = lazy(() => import("./pages/PlatformRecommendationEngineConfigScreen.tsx"));
const PlatformOrchestratorConfigScreen = lazy(() => import("./pages/PlatformOrchestratorConfigScreen.tsx"));
const PlatformOnboardingConfigScreen = lazy(() => import("./pages/PlatformOnboardingConfigScreen.tsx"));
const PlatformAIComingSoonScreen = lazy(() => import("./pages/PlatformAIComingSoonScreen.tsx"));
const PlatformKnowledgeHubScreen = lazy(() => import("./pages/PlatformKnowledgeHubScreen.tsx"));
const PlatformAILabScreen = lazy(() => import("./pages/PlatformAILabScreen.tsx"));
const PlatformGamificationScreen = lazy(() => import("./pages/PlatformGamificationScreen.tsx"));
const PlatformBillingHubScreen = lazy(() => import("./pages/PlatformBillingHubScreen.tsx"));
import ContactUsScreen from "./components/ContactUsScreen.tsx";
import ReadingSettingsScreen from "./components/settings/ReadingSettingsScreen.tsx";

const queryClient = new QueryClient();

const RH = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRoles={["owner", "rh_admin"]}>{children}</ProtectedRoute>
);
const Ent = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRoles={["owner", "rh_admin", "leader", "employee"]} requireEmployeeProfile>{children}</ProtectedRoute>
);
const Auth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading, roles, hasEmployeeProfile } = useAuth();

  if (!loading && isAuthenticated && roles.includes("platform_admin")) {
    return <Navigate to={getDefaultAuthenticatedPath(roles, hasEmployeeProfile)} replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};
const PlatformAdmin = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRoles={["platform_admin"]}>{children}</ProtectedRoute>
);

// Mantém a tela atual visível enquanto o chunk da próxima rota carrega.
// Só troca a UI quando o novo componente estiver pronto — evita "tela branca".
const DeferredRoutes = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [, startTransition] = useTransition();
  useEffect(() => {
    startTransition(() => setDisplayLocation(location));
  }, [location]);
  return (
    <Suspense fallback={null}>
      <Routes location={displayLocation}>{children}</Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <OrgBrandingProvider>
        <OrgLocaleProvider>
        <OrganizationWorkScheduleProvider>
        <DeferredRoutes>
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
          <Route path="/enterprise/minha-privacidade" element={<Auth><MyPrivacyScreen /></Auth>} />
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
          <Route path="/enterprise/rh/cargos" element={<RH><EnterpriseJobPositionsScreen /></RH>} />
          <Route path="/enterprise/rh/multiplos-admins" element={<RH><EnterpriseMultiAdminsScreen /></RH>} />
          <Route path="/enterprise/rh/rituais/guiados" element={<Navigate to="/enterprise/rh/rituais-inteligentes" replace />} />
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
          <Route path="/enterprise/rh/configuracoes" element={<RH><EnterpriseSettingsScreen /></RH>} />
          <Route path="/enterprise/rh/configuracoes/legado" element={<RH><EnterpriseCompanySettingsScreen /></RH>} />
          <Route path="/enterprise/rh/dominio" element={<RH><EnterpriseDomainAccessScreen /></RH>} />
          <Route path="/enterprise/rh/departamento/:id" element={<RH><EnterpriseDepartmentDetailScreen /></RH>} />
          <Route path="/enterprise/rh/plano-acao" element={<RH><EnterpriseActionPlanScreen /></RH>} />
          <Route path="/enterprise/rh/integracao" element={<RH><EnterpriseAdminIntegrationScreen /></RH>} />
          <Route path="/enterprise/rh/benchmark" element={<RH><EnterpriseBenchmarkScreen /></RH>} />
          <Route path="/enterprise/rh/lideranca" element={<RH><EnterpriseLeadershipOverviewScreen /></RH>} />
          <Route path="/enterprise/rh/impacto" element={<RH><EnterpriseImpactEngineScreen /></RH>} />
          <Route path="/enterprise/rh/mapa-emocional" element={<RH><EnterpriseEmotionalMapScreen /></RH>} />
          <Route path="/enterprise/rh/comunicados" element={<RH><EnterpriseLeadershipMessageScreen /></RH>} />
          <Route path="/enterprise/rh/insights-ia" element={<Navigate to="/enterprise/rh/insights-semanais" replace />} />
          <Route path="/enterprise/rh/denuncias" element={<RH><EnterpriseRHReportsScreen /></RH>} />
          <Route path="/enterprise/rh/denuncias/:id" element={<RH><EnterpriseRHReportDetailScreen /></RH>} />
          <Route path="/enterprise/rh/sos" element={<RH><EnterpriseRHReportsScreen /></RH>} />
          <Route path="/enterprise/rh/evolucao" element={<RH><EnterpriseJourneyEvolutionScreen /></RH>} />
          <Route path="/enterprise/rh/status" element={<RH><EnterpriseStatusHealthScreen /></RH>} />
          <Route path="/enterprise/rh/rituais" element={<Navigate to="/enterprise/rh/rituais-inteligentes" replace />} />
          <Route path="/enterprise/rh/rituais-inteligentes" element={<RH><EnterpriseIntelligentRitualsScreen /></RH>} />
          <Route path="/enterprise/rh/rituais/participacoes" element={<RH><EnterpriseRitualParticipationsScreen /></RH>} />
          <Route path="/enterprise/rh/score-organizacional" element={<RH><EnterpriseOrganizationalScoreScreen /></RH>} />
          <Route path="/enterprise/rituais" element={<Navigate to="/enterprise/rh/rituais-inteligentes" replace />} />
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
          <Route path="/admin/search" element={<PlatformAdmin><PlatformSearchScreen /></PlatformAdmin>} />
          <Route path="/admin/docs" element={<PlatformAdmin><PlatformDocsScreen /></PlatformAdmin>} />
          <Route path="/admin/account" element={<PlatformAdmin><PlatformAccountScreen /></PlatformAdmin>} />
          <Route path="/admin/security" element={<PlatformAdmin><PlatformSecurityScreen /></PlatformAdmin>} />
          <Route path="/admin/organizations" element={<PlatformAdmin><PlatformOrganizationsScreen /></PlatformAdmin>} />
          <Route path="/admin/organizations/:id" element={<PlatformAdmin><PlatformOrganizationDetailScreen /></PlatformAdmin>} />
          <Route path="/admin/owners" element={<Navigate to="/admin/organizations" replace />} />
          <Route path="/admin/subscriptions" element={<PlatformAdmin><PlatformSubscriptionsScreen /></PlatformAdmin>} />
          <Route path="/admin/plans" element={<PlatformAdmin><PlatformPlansScreen /></PlatformAdmin>} />
          <Route path="/admin/billing" element={<PlatformAdmin><PlatformBillingScreen /></PlatformAdmin>} />
          <Route path="/admin/ai-usage" element={<PlatformAdmin><PlatformAIUsageScreen /></PlatformAdmin>} />
          <Route path="/admin/ai/provider" element={<PlatformAdmin><PlatformAIProviderScreen /></PlatformAdmin>} />
          <Route path="/admin/analytics" element={<PlatformAdmin><PlatformAnalyticsScreen /></PlatformAdmin>} />
          <Route path="/admin/system" element={<PlatformAdmin><PlatformSystemHealthScreen /></PlatformAdmin>} />
          <Route path="/admin/system/backup" element={<PlatformAdmin><PlatformBackupRecoveryScreen /></PlatformAdmin>} />
          <Route path="/admin/system/performance" element={<PlatformAdmin><PlatformPerformanceCenterScreen /></PlatformAdmin>} />
          <Route path="/admin/system/qa" element={<PlatformAdmin><PlatformQACenterScreen /></PlatformAdmin>} />
          <Route path="/admin/support" element={<PlatformAdmin><PlatformSupportScreen /></PlatformAdmin>} />
          <Route path="/admin/audit" element={<PlatformAdmin><PlatformAuditScreen /></PlatformAdmin>} />
          <Route path="/admin/settings" element={<PlatformAdmin><PlatformSettingsScreen /></PlatformAdmin>} />
          <Route path="/admin/content" element={<PlatformAdmin><PlatformContentDashboardScreen /></PlatformAdmin>} />
          <Route path="/admin/content/authors" element={<PlatformAdmin><PlatformContentAuthorsScreen /></PlatformAdmin>} />
          <Route path="/admin/content/categories" element={<PlatformAdmin><PlatformContentCategoriesScreen /></PlatformAdmin>} />
          <Route path="/admin/content/tags" element={<PlatformAdmin><PlatformContentTagsScreen /></PlatformAdmin>} />
          <Route path="/admin/content/books" element={<PlatformAdmin><PlatformContentBooksScreen /></PlatformAdmin>} />
          <Route path="/admin/content/courses" element={<PlatformAdmin><PlatformContentCoursesScreen /></PlatformAdmin>} />
          <Route path="/admin/content/courses/:id" element={<PlatformAdmin><PlatformContentCourseBuilderScreen /></PlatformAdmin>} />
          <Route path="/admin/content/tracks" element={<PlatformAdmin><PlatformContentTracksScreen /></PlatformAdmin>} />
          <Route path="/admin/content/tracks/:id" element={<PlatformAdmin><PlatformContentTrackBuilderScreen /></PlatformAdmin>} />
         <Route path="/admin/content/podcasts" element={<PlatformAdmin><PlatformContentPodcastsScreen /></PlatformAdmin>} />
         <Route path="/admin/content/videos" element={<PlatformAdmin><PlatformContentVideosScreen /></PlatformAdmin>} />
         <Route path="/admin/content/audios" element={<PlatformAdmin><PlatformContentAudiosScreen /></PlatformAdmin>} />
         <Route path="/admin/content/materials" element={<PlatformAdmin><PlatformContentMaterialsScreen /></PlatformAdmin>} />
         <Route path="/admin/content/collections" element={<PlatformAdmin><PlatformContentCollectionsScreen /></PlatformAdmin>} />
         <Route path="/admin/content/collections/:id" element={<PlatformAdmin><PlatformContentCollectionBuilderScreen /></PlatformAdmin>} />
         <Route path="/admin/content/library" element={<PlatformAdmin><PlatformContentLibraryScreen /></PlatformAdmin>} />
         <Route path="/admin/content/hub" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/competencies" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/emotions" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/reflections" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/messages" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/quizzes" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/certificates" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/imports" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/versions" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />
         <Route path="/admin/content/analytics" element={<PlatformAdmin><PlatformCMSHubScreen /></PlatformAdmin>} />

         {/* Gamification (Fase 26) */}
         <Route path="/admin/gamification" element={<PlatformAdmin><PlatformGamificationScreen /></PlatformAdmin>} />
         <Route path="/admin/gamification/:section" element={<PlatformAdmin><PlatformGamificationScreen /></PlatformAdmin>} />

         {/* Billing (Fase 27) */}
         <Route path="/admin/billing/hub" element={<PlatformAdmin><PlatformBillingHubScreen /></PlatformAdmin>} />
         <Route path="/admin/billing/hub/:section" element={<PlatformAdmin><PlatformBillingHubScreen /></PlatformAdmin>} />

         {/* Inteligência Artificial */}
         <Route path="/admin/ai" element={<PlatformAdmin><PlatformAIComingSoonScreen title="Visão Geral" description="Painel consolidado dos módulos de IA será liberado em breve." /></PlatformAdmin>} />
         <Route path="/admin/ai/conselho-executivo" element={<PlatformAdmin><PlatformExecutiveCouncilConfigScreen /></PlatformAdmin>} />
        <Route path="/admin/ai/dna-organizacional" element={<PlatformAdmin><PlatformOrganizationalDNAConfigScreen /></PlatformAdmin>} />
        <Route path="/admin/ai/insights-semanais" element={<PlatformAdmin><PlatformWeeklyInsightsConfigScreen /></PlatformAdmin>} />
        <Route path="/admin/ai/planos-acao" element={<PlatformAdmin><PlatformActionPlanConfigScreen /></PlatformAdmin>} />
        <Route path="/admin/ai/rituais-inteligentes" element={<PlatformAdmin><PlatformIntelligentRitualConfigScreen /></PlatformAdmin>} />
         <Route path="/admin/ai/rituais-inteligentes" element={<PlatformAdmin><PlatformAIComingSoonScreen title="Rituais Inteligentes" /></PlatformAdmin>} />
         <Route path="/admin/ai/recomendacoes" element={<PlatformAdmin><PlatformRecommendationEngineConfigScreen /></PlatformAdmin>} />
        <Route path="/admin/ai/orchestrator" element={<PlatformAdmin><PlatformOrchestratorConfigScreen /></PlatformAdmin>} />
        <Route path="/admin/ai/onboarding" element={<PlatformAdmin><PlatformOnboardingConfigScreen /></PlatformAdmin>} />
         <Route path="/admin/knowledge" element={<PlatformAdmin><PlatformKnowledgeHubScreen /></PlatformAdmin>} />
          <Route path="/admin/ai/lab" element={<PlatformAdmin><PlatformAILabScreen /></PlatformAdmin>} />

          <Route path="*" element={<Auth><NotFound /></Auth>} />
        </DeferredRoutes>
        </OrganizationWorkScheduleProvider>
        </OrgLocaleProvider>
        </OrgBrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
