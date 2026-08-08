import api from "./axios";

// Types

// Per-section RBAC. Must match the backend's `AdminSection` enum exactly —
// these values are what the server-side guard checks against.
export const ADMIN_SECTIONS = [
  "USER_MANAGEMENT",
  "AGENT_MANAGEMENT",
  "PROPERTY_MANAGEMENT",
  "LAND_PROTECTION",
  "BUY_ENQUIRIES",
  "SELL_REQUESTS",
  "SERVICES",
  "EXECUTIVE_MANAGEMENT",
  "LEADS",
  "LISTING_REQUESTS",
  "PAYMENTS",
  "MARKETING",
  "PINCODES",
  "REPORTS",
  "ROLES_PERMISSIONS",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: AdminSection[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  admin: AdminUser;
  tokens: AuthTokens;
  message?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Methods
export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/admin/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>("/admin/auth/register", data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await api.patch<AdminUser>("/admin/auth/profile", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    await api.patch("/admin/auth/password", data);
  },
};

// Dashboard Types
export interface DashboardStats {
  total: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  active?: number;
  inactive?: number;
  verified?: number;
  contacted?: number;
  quoteSent?: number;
  accepted?: number;
  reviewed?: number;
  pendingKyc?: number;
  approvedKyc?: number;
  featured?: number;
}

export interface DashboardData {
  totalUsers: number;
  totalAgents: DashboardStats;
  loanApplications: DashboardStats;
  landProtection: DashboardStats;
  layoutEnquiries: number;
  buyPlots: {
    total: number;
  };
  sellPlots: DashboardStats;
  latestListings: DashboardStats;
  legalVerification: DashboardStats;
}

// Dashboard API
export interface PlotListingsGrowthPoint {
  date: string;
  count: number;
}

export interface PlotListingsGrowthResponse {
  data: PlotListingsGrowthPoint[];
  totalLast30Days: number;
  percentChange: number | null;
}

export type DashboardDateRange = "today" | "week" | "month" | "custom";

export interface PropertyCategoryBreakdown {
  category: string;
  total: number;
  active: number;
  sold: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface DashboardOverview {
  totalUsers: number;
  totalAgents: number;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalProperties: number;
  propertiesPendingApproval: number;
  activeListings: number;
  soldProperties: number;
  todaysLeads: number;
  totalLeads: number;
  loanRequests: number;
  legalVerificationRequests: number;
  registrationRequests: number;
  landProtectionRequests: number;
  revenueToday: number;
  monthlyRevenue: number;
  totalRevenue: number;
  propertiesByCategory: PropertyCategoryBreakdown[];
  roleCounts: RoleCount[];
  appliedRange: { from: string; to: string };
}

export interface RecentActivityItem {
  type:
    | "USER_REGISTERED"
    | "PROPERTY_UPLOADED"
    | "AGENT_JOINED"
    | "PROPERTY_APPROVED"
    | "LEGAL_REQUEST_RECEIVED"
    | "INSPECTION_COMPLETED";
  message: string;
  occurredAt: string;
}

export interface AreaDistributionZone {
  /** The property's city/locality, or "Unspecified" if not set */
  zone: string;
  total: number;
  byCategory: { category: string; count: number }[];
}

export interface TopAgent {
  agentId: string;
  name: string;
  properties: number;
  leads: number;
  conversionRate: number | null;
  totalCommissionAmount: number;
}

export const dashboardApi = {
  getDashboard: async () => {
    const response = await api.get<DashboardData>("/admin/dashboard");
    return response.data;
  },

  getPlotListingsGrowth: async () => {
    const response = await api.get<PlotListingsGrowthResponse>(
      "/admin/dashboard/plot-listings-growth",
    );
    return response.data;
  },

  getOverview: async (range: DashboardDateRange = "month", from?: string, to?: string) => {
    const params = new URLSearchParams({ range });
    if (range === "custom" && from && to) {
      params.set("from", from);
      params.set("to", to);
    }
    const response = await api.get<DashboardOverview>(
      `/admin/dashboard/overview?${params.toString()}`,
    );
    return response.data;
  },

  getRecentActivity: async (limit: number = 8) => {
    const response = await api.get<RecentActivityItem[]>(
      `/admin/dashboard/recent-activity?limit=${limit}`,
    );
    return response.data;
  },

  getAreaDistribution: async () => {
    const response = await api.get<AreaDistributionZone[]>(
      "/admin/dashboard/area-distribution",
    );
    return response.data;
  },

  getTopAgents: async (limit: number = 5) => {
    const response = await api.get<TopAgent[]>(
      `/admin/dashboard/top-agents?limit=${limit}`,
    );
    return response.data;
  },

  getRevenueGrowth: async () => {
    const response = await api.get<{
      data: { date: string; amount: number }[];
      totalLast30Days: number;
    }>("/admin/dashboard/revenue-growth");
    return response.data;
  },
};

// User Types
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  name: string | null;
  profilePicture: string | null;
  location: string | null;
  employment: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  provider: string;
  isProfileComplete: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  data: User[];
  meta: PaginationMeta;
}

// A user's saved wishlist item -- same shape as the public GET /wishlist
// response (see backend WishlistItemResponseDto), just fetched through the
// admin path-param route GET /admin/users/:id/wishlist instead of the
// JWT-derived GET /wishlist used by the mobile app.
export type WishlistItemType = "PROPERTY" | "LAYOUT";

export interface WishlistItem {
  id: string;
  type: WishlistItemType;
  propertyId: string | null;
  layoutId: string | null;
  property?: Property | null;
  layout?: Layout | null;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistListResponse {
  data: WishlistItem[];
  meta: PaginationMeta;
}

// Users API
export const usersApi = {
  getUsers: async (page: number = 1, limit: number = 10, search?: string) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const response = await api.get<UsersResponse>(
      `/admin/users?page=${page}&limit=${limit}${searchParam}`,
    );
    return response.data;
  },

  createUser: async (data: {
    name: string;
    phone: string;
    countryCode?: string;
    email?: string;
    password?: string;
    gender?: string;
    dateOfBirth?: string;
    location?: string;
    employment?: string;
  }) => {
    const response = await api.post<{ user: User; message: string }>(
      "/admin/users",
      data,
    );
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  setUserStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch<{
      id: string;
      isActive: boolean;
      message: string;
    }>(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  verifyUser: async (id: string) => {
    const response = await api.patch<{
      id: string;
      isVerified: boolean;
      message: string;
    }>(`/admin/users/${id}/verify`, {});
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<{ message: string }>(
      `/admin/users/${id}`,
    );
    return response.data;
  },

  getUserWishlist: async (
    id: string,
    page: number = 1,
    limit: number = 10,
    type?: WishlistItemType,
  ) => {
    const response = await api.get<WishlistListResponse>(
      `/admin/users/${id}/wishlist`,
      { params: { page, limit, type } },
    );
    return response.data;
  },
};

// Agent Types
export interface Agent {
  id: string;
  agentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  addressLine: string;
  district: string;
  mandal: string;
  village: string;
  pincode: string;
  aadharCardUrl: string;
  panCardUrl: string;
  kycStatus: string;
  kycRemarks: string | null;
  payeeName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifscCode: string;
  accountType: string;
  assignedDistrict: string;
  assignedMandal: string;
  assignedVillage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentsResponse {
  data: Agent[];
  meta: PaginationMeta;
}

export interface AgentStatusChange {
  id: string;
  kycStatus: string;
  isActive: boolean;
  message: string;
}

// Agents API
export const agentsApi = {
  getAgents: async (page: number = 1, limit: number = 10, search?: string) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const response = await api.get<AgentsResponse>(
      `/admin/agents?page=${page}&limit=${limit}${searchParam}`,
    );
    return response.data;
  },

  getAgentById: async (id: string) => {
    const response = await api.get<Agent>(`/admin/agents/${id}`);
    return response.data;
  },

  createAgent: async (formData: FormData) => {
    const response = await api.post<Agent>("/admin/agents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  approveKyc: async (id: string) => {
    const response = await api.patch<AgentStatusChange>(
      `/admin/agents/${id}/approve-kyc`,
    );
    return response.data;
  },

  rejectKyc: async (id: string) => {
    const response = await api.patch<AgentStatusChange>(
      `/admin/agents/${id}/reject-kyc`,
    );
    return response.data;
  },

  activateAgent: async (id: string) => {
    const response = await api.patch<AgentStatusChange>(
      `/admin/agents/${id}/activate`,
    );
    return response.data;
  },

  deactivateAgent: async (id: string) => {
    const response = await api.patch<AgentStatusChange>(
      `/admin/agents/${id}/deactivate`,
    );
    return response.data;
  },

  deleteAgent: async (id: string) => {
    await api.delete(`/admin/agents/${id}`);
  },

  // Properties an agent has had approved via their submissions -- same
  // response shape as every other admin property list endpoint.
  getAgentProperties: async (
    id: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    const response = await api.get<PropertiesResponse>(
      `/admin/agents/${id}/properties`,
      { params: { page, limit } },
    );
    return response.data;
  },
};

// Property Types
export interface OverviewField {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  displayOrder: number;
}

export interface Property {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string | null;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  priceRange: string;
  locationAddress: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  images: string[];
  brochureUrl: string;
  landLayoutTitle: string;
  landLayoutImageUrl: string;
  descriptionTitle: string;
  descriptionContent: string;
  overviewFields: OverviewField[];
  isActive: boolean;
  isFeatured: boolean;
  isExploreNearby: boolean;
  isLatestListing: boolean;
  isTrending: boolean;
  isHotSale: boolean;
  isSold: boolean;
  soldAt: string | null;
  isPremium: boolean;
  isArchived: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesResponse {
  data: Property[];
  meta: PaginationMeta;
}

// A property annotated with recent-view aggregate stats, returned by the
// admin "Recently Viewed" endpoint (one row per property, most-recently
// viewed first) -- distinct from the end-user's personal recently-viewed list.
export interface AdminRecentlyViewedItem extends Property {
  lastViewedAt: string;
  recentViewersCount: number;
}

export interface AdminRecentlyViewedResponse {
  data: AdminRecentlyViewedItem[];
  meta: {
    total: number;
    limit: number;
  };
}

// Frozen list of property categories - must stay in sync with the backend's
// PROPERTY_CATEGORIES (landwalaa-backend/src/modules/property-submission/dto/create-property-submission.dto.ts)
export const PROPERTY_CATEGORIES = [
  "Open Plots",
  "Residential House",
  "Apartments",
  "Villas",
  "Farmhouse",
  "Agriculture Land",
  "Farmlands",
] as const;

// Properties API
export const propertiesApi = {
  getProperties: async (
    page: number = 1,
    limit: number = 10,
    isLatestListing?: boolean,
    category?: string,
    isTrending?: boolean,
    isHotSale?: boolean,
    isExploreNearby?: boolean,
  ) => {
    const response = await api.get<PropertiesResponse>("/admin/properties", {
      params: {
        page,
        limit,
        isLatestListing,
        category,
        isTrending,
        isHotSale,
        isExploreNearby,
      },
    });
    return response.data;
  },

  getPropertyById: async (id: string) => {
    const response = await api.get<Property>(`/admin/properties/${id}`);
    return response.data;
  },

  createProperty: async (formData: FormData) => {
    const response = await api.post<Property>("/admin/properties", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProperty: async (id: string, formData: FormData) => {
    const response = await api.put<Property>(
      `/admin/properties/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  deleteProperty: async (id: string) => {
    const response = await api.delete<void>(`/admin/properties/${id}`);
    return response.data;
  },

  toggleFeatured: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-featured`,
    );
    return response.data;
  },

  toggleExploreNearby: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-explore-nearby`,
    );
    return response.data;
  },

  toggleLatestListing: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-latest-listing`,
    );
    return response.data;
  },

  toggleTrending: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-trending`,
    );
    return response.data;
  },

  toggleHotSale: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-hot-sale`,
    );
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-status`,
    );
    return response.data;
  },

  toggleSold: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-sold`,
    );
    return response.data;
  },

  togglePremium: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/toggle-premium`,
    );
    return response.data;
  },

  archiveProperty: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/archive`,
    );
    return response.data;
  },

  restoreProperty: async (id: string) => {
    const response = await api.patch<Property>(
      `/admin/properties/${id}/restore`,
    );
    return response.data;
  },

  getArchivedProperties: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PropertiesResponse>("/admin/properties", {
      params: { page, limit, isArchived: true },
    });
    return response.data;
  },

  getMostViewed: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PropertiesResponse>(
      "/admin/properties/most-viewed",
      { params: { page, limit } },
    );
    return response.data;
  },

  getRecentlyViewedAdmin: async (limit: number = 20) => {
    const response = await api.get<AdminRecentlyViewedResponse>(
      "/admin/properties/recently-viewed",
      { params: { limit } },
    );
    return response.data;
  },
};

// Layout Types
export interface LayoutSlot {
  id: string;
  sectionTitle: string;
  plotNumber: string;
  area: string;
  facing: string;
  price: number;
  priceUnit: string;
  priceFormatted: string;
  status: string;
  width: string | null;
  height: string | null;
  displayOrder: number;
}

export interface Layout {
  id: string;
  title: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  priceRange: string;
  imageUrl: string;
  layoutImageUrl: string;
  slots: LayoutSlot[];
  slotsBySection: Record<string, LayoutSlot[]>;
  totalSlots: number;
  availableSlots: number;
  notAvailableSlots: number;
  isActive: boolean;
  approvalType: string | null;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutsResponse {
  data: Layout[];
  meta: PaginationMeta;
}

// Layouts API
export const layoutsApi = {
  getLayouts: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LayoutsResponse>(
      `/admin/layouts?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getLayoutById: async (id: string) => {
    const response = await api.get<Layout>(`/admin/layouts/${id}`);
    return response.data;
  },

  createLayout: async (formData: FormData) => {
    const response = await api.post<Layout>("/admin/layouts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateLayout: async (id: string, formData: FormData) => {
    const response = await api.put<Layout>(`/admin/layouts/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteLayout: async (id: string) => {
    const response = await api.delete<void>(`/admin/layouts/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.patch<Layout>(
      `/admin/layouts/${id}/toggle-status`,
    );
    return response.data;
  },

  getLayoutSlot: async (layoutId: string, slotId: string) => {
    const response = await api.get<LayoutSlot>(
      `/admin/layouts/${layoutId}/slots/${slotId}`,
    );
    return response.data;
  },

  createLayoutSlot: async (layoutId: string, data: Partial<LayoutSlot>) => {
    const response = await api.post<LayoutSlot>(
      `/admin/layouts/${layoutId}/slot`,
      data,
    );
    return response.data;
  },

  updateLayoutSlot: async (
    layoutId: string,
    slotId: string,
    data: Partial<LayoutSlot>,
  ) => {
    const response = await api.put<LayoutSlot>(
      `/admin/layouts/${layoutId}/slots/${slotId}`,
      data,
    );
    return response.data;
  },

  deleteLayoutSlot: async (layoutId: string, slotId: string) => {
    const response = await api.delete<void>(
      `/admin/layouts/${layoutId}/slots/${slotId}`,
    );
    return response.data;
  },
};

// Loan Application Types
export interface LoanDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  user: {
    id: string;
    email: string;
    phone: string;
    name: string;
    location?: string;
    employment?: string;
  };
  fullName: string;
  monthlyIncome: number;
  employmentType: string;
  loanPurpose: string;
  desiredAmount: number;
  loanTenureYears: number;
  status: string;
  documents: LoanDocument[];
  createdAt: string;
  submittedAt: string;
}

export interface LoanApplicationsResponse {
  data: LoanApplication[];
  meta: PaginationMeta;
}

// Legal Verification Types
export interface LegalVerification {
  id: string;
  user: {
    id: string;
    email: string;
    phone: string;
    name: string;
    location?: string;
    employment?: string;
  };
  status: string;
  titleDeedUrl: string;
  saleAgreementUrl: string;
  taxReceiptUrl: string;
  ecUrl: string;
  linkDocumentsUrl: string | null;
  layoutApprovalUrl: string | null;
  idProofUrl: string | null;
  assignedLawyerName: string | null;
  assignedLawyerPhone: string | null;
  assignedLawyerEmail: string | null;
  lawyerAssignedAt: string | null;
  createdAt: string;
  submittedAt: string;
}

export interface LegalVerificationsResponse {
  data: LegalVerification[];
  meta: PaginationMeta;
}

// Land Registration Types
export interface LandRegistration {
  id: string;
  user: {
    id: string;
    email: string;
    phone: string;
    name: string;
    location?: string;
    employment?: string;
  };
  status: string;
  name: string;
  phone: string;
  location: string;
  plotType: string;
  message: string;
  createdAt: string;
}

export interface LandRegistrationsResponse {
  data: LandRegistration[];
  meta: PaginationMeta;
}

// Land Protection Types
export interface LandProtection {
  id: string;
  status: string;
  fullName: string;
  phone: string;
  countryCode: string;
  landLocation: string;
  landArea: string;
  location: string;
  pincode: string;
  surveyNumbers?: string[];
  latitude: number | null;
  longitude: number | null;
  quotedAmount: number | null;
  quoteSentAt: string | null;
  adminNotes: string | null;
  isOutOfRange: boolean;
  adminApproved: boolean;
  adminApprovedAt: string | null;
  visitFrequency: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | null;
  imageUrls?: string[];
  layoutUrl?: string | null;
  userLayoutUrl?: string | null;
  dimensionPageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LandProtectionsResponse {
  requests: LandProtection[];
  total: number;
  page: number;
  limit: number;
}

export interface LandProtectionAssignment {
  id: string;
  landProtectionId: string;
  agentId: string;
  assignedById: string;
  status: string;
  rejectionReason: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  landProtection: {
    id: string;
    fullName: string;
    phone: string;
    countryCode: string;
    landLocation: string;
    landArea: string;
    location: string;
    pincode: string;
    latitude: number;
    longitude: number;
    quotedAmount: number | null;
    status: string;
    imageKeys: string[];
  };
  agent: {
    id: string;
    agentCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
    email: string;
  };
  assignedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LandProtectionAssignmentsResponse {
  data: LandProtectionAssignment[];
  meta: PaginationMeta;
}

// User Action APIs
export const userActionsApi = {
  getLoanApplications: async (
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ) => {
    const response = await api.get<LoanApplicationsResponse>(
      "/admin/loan-applications",
      { params: { page, limit, userId } },
    );
    return response.data;
  },

  getLegalVerifications: async (
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ) => {
    const response = await api.get<LegalVerificationsResponse>(
      "/admin/legal-verifications",
      { params: { page, limit, userId } },
    );
    return response.data;
  },

  getLandRegistrations: async (
    page: number = 1,
    limit: number = 10,
    userId?: string,
    search?: string,
  ) => {
    const response = await api.get<LandRegistrationsResponse>(
      "/admin/land-registrations",
      { params: { page, limit, userId, search } },
    );
    return response.data;
  },

  updateLoanApplicationStatus: async (id: string, status: string, remarks?: string) => {
    const response = await api.patch<{ id: string; status: string; message: string }>(
      `/admin/loan-applications/${id}/status`,
      { status, remarks },
    );
    return response.data;
  },

  updateLegalVerificationStatus: async (
    id: string,
    status: string,
    reviewNotes?: string,
  ) => {
    const response = await api.patch<{ id: string; status: string; message: string }>(
      `/admin/legal-verifications/${id}/status`,
      { status, reviewNotes },
    );
    return response.data;
  },

  assignLawyer: async (
    id: string,
    name: string,
    phone?: string,
    email?: string,
  ) => {
    const response = await api.patch<{ id: string; status: string; message: string }>(
      `/admin/legal-verifications/${id}/assign-lawyer`,
      { name, phone, email },
    );
    return response.data;
  },

  updateLandRegistrationStatus: async (
    id: string,
    status: string,
    adminNotes?: string,
  ) => {
    const response = await api.patch<{ id: string; status: string; message: string }>(
      `/admin/land-registrations/${id}/status`,
      { status, adminNotes },
    );
    return response.data;
  },

  getLandProtections: async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    userId?: string,
    search?: string,
  ) => {
    const response = await api.get<LandProtectionsResponse>(
      "/admin/land-protections",
      { params: { page, limit, status, userId, search } },
    );
    return response.data;
  },

  getLandProtectionById: async (id: string) => {
    const response = await api.get<LandProtection>(
      `/admin/land-protections/${id}`,
    );
    return response.data;
  },

  sendLandProtectionQuote: async (
    id: string,
    quotedAmount: number,
    visitFrequency?: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY",
  ) => {
    const response = await api.patch<LandProtection>(
      `/admin/land-protections/${id}/quote`,
      { quotedAmount, visitFrequency },
    );
    return response.data;
  },

  approveOutOfRange: async (id: string, adminNotes?: string) => {
    const response = await api.patch<{
      id: string;
      adminApproved: boolean;
      message: string;
    }>(`/admin/land-protections/${id}/approve-out-of-range`, { adminNotes });
    return response.data;
  },

  assignLandProtection: async (id: string, agentId: string) => {
    const response = await api.post<{ id: string; message: string }>(
      `/admin/land-protections/${id}/assign`,
      { agentId },
    );
    return response.data;
  },

  reassignLandProtection: async (id: string, agentId: string) => {
    const response = await api.post<{ id: string; message: string }>(
      `/admin/land-protections/${id}/reassign`,
      { agentId },
    );
    return response.data;
  },

  getLandProtectionAssignmentHistory: async (id: string) => {
    const response = await api.get<LandProtectionAssignment[]>(
      `/admin/land-protections/${id}/assignments`,
    );
    return response.data;
  },

  getLandProtectionAssignments: async (
    page: number = 1,
    limit: number = 20,
    status: string = "ACCEPTED",
  ) => {
    const response = await api.get<LandProtectionAssignmentsResponse>(
      `/admin/land-protections/assignments?status=${status}&page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getLandProtectionComments: async (id: string) => {
    const response = await api.get<LandProtectionComment[]>(
      `/admin/land-protections/${id}/comments`,
    );
    return response.data;
  },
};

export interface LandProtectionComment {
  id: string;
  landProtectionId: string;
  message: string;
  createdAt: string;
  user?: { id: string; name: string | null };
}

// Enquiry Types
export interface EnquiryUser {
  id: string;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  name: string | null;
  profilePicture: string | null;
  location: string | null;
  employment: string | null;
  isProfileComplete: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface EnquiryProperty {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  priceRange: string;
  locationAddress: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  images: string[];
  brochureUrl: string;
  landLayoutTitle: string;
  landLayoutImageUrl: string;
  descriptionTitle: string;
  descriptionContent: string;
  overviewFields: OverviewField[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnquirySlot {
  id: string;
  sectionTitle: string;
  plotNumber: string;
  area: string;
  facing: string;
  price: number;
  priceUnit: string;
  priceFormatted: string;
  status: string;
  width: string | null;
  height: string | null;
  displayOrder: number;
}

export interface EnquiryLayout {
  id: string;
  title: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  priceUnit: string;
  priceRange: string;
  imageUrl: string;
  layoutImageUrl: string;
  slots: EnquirySlot[];
  slotsBySection: Record<string, EnquirySlot[]>;
  totalSlots: number;
  availableSlots: number;
  notAvailableSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  userId: string;
  type: "LAYOUT" | "PROPERTY";
  propertyId: string | null;
  layoutId: string | null;
  slotId: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: EnquiryUser;
  property: EnquiryProperty | null;
  layout: EnquiryLayout | null;
  slot: EnquirySlot | null;
}

export interface EnquiriesResponse {
  data: Enquiry[];
  meta: PaginationMeta;
}

// Enquiries API
export const enquiriesApi = {
  getEnquiries: async (
    page: number = 1,
    limit: number = 10,
    type?: "LAYOUT" | "PROPERTY",
    search?: string,
    userId?: string,
  ) => {
    const typeParam = type ? `&type=${type}` : "";
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const userIdParam = userId ? `&userId=${userId}` : "";
    const response = await api.get<EnquiriesResponse>(
      `/admin/enquiries?page=${page}&limit=${limit}${typeParam}${searchParam}${userIdParam}`,
    );
    return response.data;
  },
};

export interface CreateCommissionPayload {
  agentId: string;
  propertyId: string;
  totalCommissionAmount: number;
  plotSize: string;
}

export interface Commission {
  id: string;
  agentId: string;
  propertyId: string;
  totalCommissionAmount: number;
  plotSize: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionSummary {
  agentId: string;
  agentName: string;
  phone: string;
  email: string;
  totalCommissionAssigned: number;
  lastAssignedAt: string;
}

export interface CommissionsResponse {
  data: CommissionSummary[];
  meta: PaginationMeta;
}

export interface LeaderboardEntry {
  agentId: string;
  agentName: string;
  totalCommissionAssigned: number;
  lastAssignedAt: string;
  rank: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  meta: PaginationMeta;
}

export interface CommissionAssignmentItem {
  id: string;
  propertyId: string;
  propertyTitle: string | null;
  totalCommissionAmount: number;
  currency: string;
  plotSize: string;
  status: string;
  assignedAt: string;
  revokedAt: string | null;
}

export interface AgentCommissionDetail {
  agentId: string;
  agentCode: string;
  agentName: string;
  phone: string;
  email: string;
  totalCommissionAssigned: number;
  assignmentCount: number;
  assignments: CommissionAssignmentItem[];
}

export const transactionsApi = {
  createCommission: async (data: CreateCommissionPayload) => {
    const response = await api.post<Commission>(
      "/admin/transactions/commissions",
      data,
    );
    return response.data;
  },

  getCommissions: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<CommissionsResponse>(
      `/admin/transactions/commissions?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getLeaderboard: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LeaderboardResponse>(
      `/admin/transactions/commissions/leaderboard?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getAgentCommissionDetail: async (agentId: string) => {
    const response = await api.get<AgentCommissionDetail>(
      `/admin/transactions/commissions/${agentId}`,
    );
    return response.data;
  },

  revokeCommission: async (commissionId: string) => {
    await api.patch(
      `/admin/transactions/commissions/assignments/${commissionId}/revoke`,
    );
  },
};

// Report Types
export interface ReportUser {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  isProfileComplete: boolean;
}

export interface ReportAgent {
  id: string;
  agentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Report {
  id: string;
  user: ReportUser | null;
  agent: ReportAgent | null;
  reportedBy: string;
  title: string;
  description: string;
  imageKeys: string[];
  imageUrls: string[];
  status: string;
  adminRemark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  data: Report[];
  meta: PaginationMeta;
}

// Reports API
export const reportsApi = {
  getReports: async (page: number = 1, limit: number = 10, search?: string) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const response = await api.get<ReportsResponse>(
      `/admin/issue-reports?page=${page}&limit=${limit}${searchParam}`,
    );
    return response.data;
  },
  getReportById: async (id: string) => {
    const response = await api.get<Report>(`/admin/issue-reports/${id}`);
    return response.data;
  },
  updateStatus: async (
    id: string,
    status: "pending" | "in_progress" | "resolved" | "closed",
    remark?: string,
  ) => {
    const response = await api.patch<{ id: string; status: string; message: string }>(
      `/admin/issue-reports/${id}/status`,
      { status, remark },
    );
    return response.data;
  },
  deleteReport: async (id: string) => {
    const response = await api.delete<{ id: string; message: string }>(
      `/admin/issue-reports/${id}`,
    );
    return response.data;
  },
};

// Listing Requests Types
export interface ListingRequestAgent {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
}

export type ListingRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ListingRequest {
  id: string;
  agentId: string;
  propertyId: string;
  status: ListingRequestStatus;
  reviewedById: string | null;
  reviewedAt: string | null;
  agent: ListingRequestAgent;
  property: Property;
  createdAt: string;
}

export interface ListingRequestsResponse {
  data: ListingRequest[];
  meta: PaginationMeta;
}

// Listing Requests API
export const listingRequestsApi = {
  getListingRequests: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<ListingRequestsResponse>(
      `/admin/listing-requests?page=${page}&limit=${limit}`,
    );
    return response.data;
  },
  getListingRequestById: async (id: string) => {
    const response = await api.get<ListingRequest>(
      `/admin/listing-requests/${id}`,
    );
    return response.data;
  },
  updateStatus: async (id: string, status: "APPROVED" | "REJECTED") => {
    const response = await api.patch<ListingRequest>(
      `/admin/listing-requests/${id}/status`,
      { status },
    );
    return response.data;
  },
};

// Sub Admins Types
export interface SubAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  sections: AdminSection[];
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubAdminsResponse {
  data: SubAdmin[];
  meta: PaginationMeta;
}

export interface CreateSubAdminPayload {
  email: string;
  name: string;
  password?: string;
  permissions: string[];
  sections?: AdminSection[];
}

export interface UpdateSubAdminPermissionsPayload {
  permissions: string[];
  sections?: AdminSection[];
}

// Sub Admins API
export const subAdminsApi = {
  getSubAdmins: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const response = await api.get<SubAdminsResponse>(
      `/admin/sub-admins?page=${page}&limit=${limit}${searchParam}`,
    );
    return response.data;
  },
  createSubAdmin: async (data: CreateSubAdminPayload) => {
    const response = await api.post<SubAdmin>(`/admin/sub-admins`, data);
    return response.data;
  },

  getSubAdminById: async (id: string) => {
    const response = await api.get<SubAdmin>(`/admin/sub-admins/${id}`);
    return response.data;
  },

  updateSubAdminPermissions: async (
    id: string,
    data: UpdateSubAdminPermissionsPayload,
  ) => {
    const response = await api.patch<SubAdmin>(
      `/admin/sub-admins/${id}/permissions`,
      data,
    );
    return response.data;
  },
};

// Subscription Plans Types
export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string[];
  price: number;
  durationMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  meta: PaginationMeta;
}

export interface CreateSubscriptionPlanPayload {
  title: string;
  description: string[];
  price: number;
  durationMonths: number;
  isActive: boolean;
}

export type UpdateSubscriptionPlanPayload =
  Partial<CreateSubscriptionPlanPayload>;

// Subscription Plans API
export const subscriptionPlansApi = {
  getSubscriptionPlans: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<SubscriptionPlansResponse>(
      `/admin/subscription-plans?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getSubscriptionPlanById: async (id: string) => {
    const response = await api.get<SubscriptionPlan>(
      `/admin/subscription-plans/${id}`,
    );
    return response.data;
  },

  createSubscriptionPlan: async (data: CreateSubscriptionPlanPayload) => {
    const response = await api.post<SubscriptionPlan>(
      "/admin/subscription-plans",
      data,
    );
    return response.data;
  },

  updateSubscriptionPlan: async (
    id: string,
    data: UpdateSubscriptionPlanPayload,
  ) => {
    const response = await api.patch<SubscriptionPlan>(
      `/admin/subscription-plans/${id}`,
      data,
    );
    return response.data;
  },

  deleteSubscriptionPlan: async (id: string) => {
    const response = await api.delete<{ message: string }>(
      `/admin/subscription-plans/${id}`,
    );
    return response.data;
  },
};

// Explore Categories (admin-managed) Types
// Bank Partners (admin-managed) Types
export interface BankPartner {
  id: string;
  name: string;
  logoKey: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  interestInfo: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankPartnersResponse {
  data: BankPartner[];
  meta: PaginationMeta;
}

export interface CreateBankPartnerPayload {
  name: string;
  logoKey?: string;
  contactEmail?: string;
  contactPhone?: string;
  interestInfo?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateBankPartnerPayload = Partial<CreateBankPartnerPayload>;

// Bank Partners (admin-managed) API
export const bankPartnersApi = {
  getPartners: async (page: number = 1, limit: number = 50) => {
    const response = await api.get<BankPartnersResponse>(
      `/admin/bank-partners?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  createPartner: async (data: CreateBankPartnerPayload) => {
    const response = await api.post<BankPartner>("/admin/bank-partners", data);
    return response.data;
  },

  updatePartner: async (id: string, data: UpdateBankPartnerPayload) => {
    const response = await api.patch<BankPartner>(
      `/admin/bank-partners/${id}`,
      data,
    );
    return response.data;
  },

  deletePartner: async (id: string) => {
    const response = await api.delete<void>(`/admin/bank-partners/${id}`);
    return response.data;
  },
};

// Land Protection Content (Videos) Types
export interface LandProtectionVideo {
  id: string;
  videoUrl: string;
  title: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LandProtectionVideoListResponse {
  data: LandProtectionVideo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type LandProtectionVideoUploadTaskStatus =
  | "QUEUED"
  | "UPLOADING"
  | "COMPLETED"
  | "FAILED";

// Adding a video kicks off an async upload/processing task (large video
// files) -- the create call returns this task, which must be polled via
// getUploadTask until it reaches COMPLETED/FAILED.
export interface LandProtectionVideoUploadTask {
  id: string;
  status: LandProtectionVideoUploadTaskStatus;
  errorMessage: string | null;
  videoId: string | null;
  originalName: string;
  createdAt: string;
  updatedAt: string;
}

// Land Protection Content (admin-managed videos) API
export const landProtectionContentApi = {
  getVideos: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LandProtectionVideoListResponse>(
      "/admin/land-protection-content/videos",
      { params: { page, limit } },
    );
    return response.data;
  },

  addVideo: async (title: string, file: File, displayOrder?: number) => {
    const formData = new FormData();
    formData.append("title", title);
    if (displayOrder !== undefined) {
      formData.append("displayOrder", String(displayOrder));
    }
    formData.append("video", file);
    const response = await api.post<LandProtectionVideoUploadTask>(
      "/admin/land-protection-content/videos",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  updateVideo: async (
    id: string,
    data: { title?: string; displayOrder?: number },
    file?: File,
  ) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.displayOrder !== undefined) {
      formData.append("displayOrder", String(data.displayOrder));
    }
    if (file) formData.append("video", file);
    const response = await api.patch<LandProtectionVideo>(
      `/admin/land-protection-content/videos/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  deleteVideo: async (id: string) => {
    const response = await api.delete<void>(
      `/admin/land-protection-content/videos/${id}`,
    );
    return response.data;
  },

  getUploadTask: async (id: string) => {
    const response = await api.get<LandProtectionVideoUploadTask>(
      `/admin/land-protection-content/video-upload-tasks/${id}`,
    );
    return response.data;
  },
};

// Property Submissions Types
export interface PropertySubmissionUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
}

export interface PropertySubmissionAgent {
  id: string;
  agentCode: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface PropertySubmission {
  id: string;
  userId: string | null;
  title: string;
  size: string;
  unit: string | null;
  category: string | null;
  facing: string;
  price: string | null;
  priceNegotiable: string | null;
  listingType: string | null;
  plotLocation: string | null;
  location: string | null;
  pincode: string | null;
  description?: string | null;
  imageUrls: string[];
  layoutImageUrls: string[];
  documentUrls: string[];
  status: string;
  submittedBy: "USER" | "AGENT";
  user?: PropertySubmissionUser | null;
  agent?: PropertySubmissionAgent | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertySubmissionsResponse {
  data: PropertySubmission[];
  meta: PaginationMeta;
}

// Property Submissions API
export const propertySubmissionsApi = {
  getSubmissions: async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
    userId?: string,
  ) => {
    const response = await api.get<PropertySubmissionsResponse>(
      "/admin/property-submissions",
      { params: { page, limit, status, search, userId } },
    );
    return response.data;
  },

  getSubmissionById: async (id: string) => {
    const response = await api.get<PropertySubmission>(
      `/admin/property-submissions/${id}`,
    );
    return response.data;
  },

  approveSubmission: async (id: string) => {
    const response = await api.patch<{
      submission: PropertySubmission;
      message: string;
    }>(`/admin/property-submissions/${id}/approve`, {});
    return response.data;
  },

  rejectSubmission: async (id: string) => {
    const response = await api.patch<{ message: string }>(
      `/admin/property-submissions/${id}/reject`,
      {},
    );
    return response.data;
  },
};

// Pincode Types
export interface PincodeItem {
  id: string;
  location: string;
  pincode: string;
  area?: string | null;
}

export interface PincodeListResponse {
  items: PincodeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Pincode Serviceability API
export const pincodesApi = {
  getPincodes: async (q?: string, page: number = 1, limit: number = 20) => {
    const response = await api.get<PincodeListResponse>("/pincodes", {
      params: { q, page, limit },
    });
    return response.data;
  },

  addPincode: async (pincode: string, location: string, area?: string) => {
    const response = await api.post<PincodeItem>("/pincodes", {
      pincode,
      location,
      area,
    });
    return response.data;
  },

  bulkAddPincodes: async (
    pincodes: { pincode: string; location: string; area?: string }[],
  ) => {
    const response = await api.post<{ added: number }>("/pincodes/bulk", {
      pincodes,
    });
    return response.data;
  },

  updatePincode: async (
    id: string,
    data: { pincode?: string; location?: string; area?: string },
  ) => {
    const response = await api.put<PincodeItem>(`/pincodes/${id}`, data);
    return response.data;
  },

  deletePincode: async (id: string) => {
    const response = await api.delete<{ message: string }>(
      `/pincodes/${id}`,
    );
    return response.data;
  },
};

// Banner Types
export type BannerItemType = "PROPERTY" | "LAYOUT";

export interface BannerItem {
  id: string;
  type: BannerItemType;
  propertyId: string | null;
  layoutId: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  property?: Property | null;
  layout?: Layout | null;
}

export interface BannerListResponse {
  data: BannerItem[];
  meta: PaginationMeta;
}

// Banners API (featured properties/layouts shown on the home banner carousel)
export const bannersApi = {
  getBanners: async (
    page: number = 1,
    limit: number = 50,
    type?: BannerItemType,
  ) => {
    const response = await api.get<BannerListResponse>("/admin/banner", {
      params: { page, limit, type },
    });
    return response.data;
  },

  addToBanner: async (
    type: BannerItemType,
    itemId: string,
    displayOrder?: number,
  ) => {
    const body: {
      type: BannerItemType;
      propertyId?: string;
      layoutId?: string;
      displayOrder?: number;
    } = { type, displayOrder };
    if (type === "PROPERTY") body.propertyId = itemId;
    else body.layoutId = itemId;

    const response = await api.post<BannerItem>("/admin/banner", body);
    return response.data;
  },

  removeFromBanner: async (bannerItemId: string) => {
    await api.delete(`/admin/banner/${bannerItemId}`);
  },
};

// Subscription Purchase (payment transaction) Types
export interface SubscriptionPurchaseUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface SubscriptionPurchasePlan {
  id: string;
  title: string;
  price: number;
  durationMonths: number;
}

export interface SubscriptionPurchase {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  cfOrderId: string;
  orderStatus: string;
  subscriptionStartsAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: SubscriptionPurchaseUser;
  plan: SubscriptionPurchasePlan;
}

export interface SubscriptionPurchasesResponse {
  data: SubscriptionPurchase[];
  meta: PaginationMeta;
}

// Subscription Purchases (payment transactions) API
export const subscriptionPurchasesApi = {
  getAllPurchases: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string,
  ) => {
    const response = await api.get<SubscriptionPurchasesResponse>(
      "/admin/subscription-purchases",
      { params: { page, limit, status, userId } },
    );
    return response.data;
  },
};

// Generic Payment Types (e.g. land protection quote payments - distinct
// from subscription plan purchases)
export interface GenericPaymentUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface GenericPayment {
  id: string;
  userId: string;
  cfOrderId: string;
  amount: number;
  currency: string;
  note: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: GenericPaymentUser;
}

export interface GenericPaymentsResponse {
  data: GenericPayment[];
  meta: PaginationMeta;
}

export const genericPaymentsApi = {
  getAllPayments: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string,
  ) => {
    const response = await api.get<GenericPaymentsResponse>(
      "/admin/payments",
      { params: { page, limit, status, userId } },
    );
    return response.data;
  },
};

// Executive Types (field staff who do GPS-verified land inspections -
// a role distinct from Agent)
export interface Executive {
  id: string;
  executiveCode: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string | null;
  assignedDistrict: string;
  assignedMandal: string;
  assignedVillage: string;
  role: string | null;
  department: string | null;
  managerId: string | null;
  managerName: string | null;
  salary: number | null;
  performanceRating: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutivesResponse {
  data: Executive[];
  meta: PaginationMeta;
}

export interface ExecutivePerformance {
  assignedCount: number;
  visitedCount: number;
  visitedThisMonth: number;
  pendingCount: number;
  overdueCount: number;
}

export interface ExecutiveDocument {
  id: string;
  name: string;
  fileUrl: string;
  createdAt: string;
}

export interface UpdateExecutiveProfilePayload {
  role?: string;
  department?: string;
  managerId?: string;
  salary?: number;
  performanceRating?: number;
}

export const executivesApi = {
  getExecutives: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) => {
    const response = await api.get<ExecutivesResponse>("/admin/executives", {
      params: { page, limit, search },
    });
    return response.data;
  },

  getExecutiveById: async (id: string) => {
    const response = await api.get<Executive>(`/admin/executives/${id}`);
    return response.data;
  },

  createExecutive: async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    gender?: string;
    assignedDistrict: string;
    assignedMandal: string;
    assignedVillage: string;
  }) => {
    const response = await api.post<{
      executive: Executive;
      message: string;
    }>("/admin/executives", data);
    return response.data;
  },

  setStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch<{
      id: string;
      isActive: boolean;
      message: string;
    }>(`/admin/executives/${id}/status`, { isActive });
    return response.data;
  },

  getPerformance: async (id: string) => {
    const response = await api.get<ExecutivePerformance>(
      `/admin/executives/${id}/performance`,
    );
    return response.data;
  },

  updateProfile: async (id: string, data: UpdateExecutiveProfilePayload) => {
    const response = await api.patch<Executive>(
      `/admin/executives/${id}`,
      data,
    );
    return response.data;
  },

  getDocuments: async (id: string) => {
    const response = await api.get<ExecutiveDocument[]>(
      `/admin/executives/${id}/documents`,
    );
    return response.data;
  },

  uploadDocument: async (id: string, name: string, file: File) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);
    const response = await api.post<ExecutiveDocument>(
      `/admin/executives/${id}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  deleteDocument: async (id: string, documentId: string) => {
    const response = await api.delete<void>(
      `/admin/executives/${id}/documents/${documentId}`,
    );
    return response.data;
  },
};

// Executive Attendance Types
export interface AttendanceRecord {
  id: string;
  executiveId: string;
  checkInAt: string;
  checkInLat: number;
  checkInLng: number;
  checkOutAt: string | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  createdAt: string;
}

export interface AdminAttendanceRecord extends AttendanceRecord {
  executiveName: string;
  executiveCode: string | null;
}

export interface AttendanceRecordsResponse {
  data: AdminAttendanceRecord[];
  meta: PaginationMeta;
}

export const executiveAttendanceApi = {
  getForExecutive: async (executiveId: string, page: number = 1, limit: number = 30) => {
    const response = await api.get<AttendanceRecordsResponse>(
      "/admin/executive-attendance",
      { params: { executiveId, page, limit } },
    );
    return response.data;
  },
};

// Inspection Land Types (lands to be GPS-verified by executives)
export interface InspectionLand {
  id: string;
  landCode: string | null;
  ownerName: string;
  ownerPhone: string | null;
  surveyNumbers: string[];
  district: string;
  mandal: string;
  village: string;
  location: string;
  pincode: string;
  areaValue: number | null;
  areaUnit: string | null;
  latitude: number;
  longitude: number;
  landProtectionId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionLandsResponse {
  data: InspectionLand[];
  meta: PaginationMeta;
}

export const inspectionLandsApi = {
  getLands: async (page: number = 1, limit: number = 10, search?: string) => {
    const response = await api.get<InspectionLandsResponse>(
      "/admin/inspection-lands",
      { params: { page, limit, search } },
    );
    return response.data;
  },

  getLandById: async (id: string) => {
    const response = await api.get<InspectionLand>(
      `/admin/inspection-lands/${id}`,
    );
    return response.data;
  },

  createLand: async (data: {
    ownerName: string;
    ownerPhone?: string;
    surveyNumbers: string[];
    district: string;
    mandal: string;
    village: string;
    location: string;
    pincode: string;
    areaValue?: number;
    areaUnit?: string;
    latitude: number;
    longitude: number;
    landProtectionId?: string;
  }) => {
    const response = await api.post<{
      land: InspectionLand;
      message: string;
    }>("/admin/inspection-lands", data);
    return response.data;
  },

  updateLand: async (id: string, data: Partial<InspectionLand>) => {
    const response = await api.patch<InspectionLand>(
      `/admin/inspection-lands/${id}`,
      data,
    );
    return response.data;
  },
};

// Land Inspection Assignment Types (assigning an InspectionLand to an Executive)
export interface LandInspectionAssignment {
  id: string;
  landId: string;
  executiveId: string;
  assignedById: string;
  isActive: boolean;
  nextVisitDueAt: string | null;
  unassignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  land?: {
    id: string;
    landCode: string | null;
    ownerName: string;
    district: string;
    mandal: string;
    village: string;
    location: string;
    latitude: number;
    longitude: number;
  };
  executive?: {
    id: string;
    executiveCode: string | null;
    fullName: string;
    phone: string;
    email: string;
  };
  assignedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LandInspectionAssignmentsResponse {
  data: LandInspectionAssignment[];
  meta: PaginationMeta;
}

export const landInspectionAssignmentApi = {
  assign: async (
    landId: string,
    executiveId: string,
    nextVisitDueAt?: string,
  ) => {
    const response = await api.post<LandInspectionAssignment>(
      `/admin/inspection-lands/${landId}/assign`,
      { executiveId, nextVisitDueAt },
    );
    return response.data;
  },

  reassign: async (
    assignmentId: string,
    executiveId: string,
    nextVisitDueAt?: string,
  ) => {
    const response = await api.patch<LandInspectionAssignment>(
      `/admin/land-inspection-assignments/${assignmentId}/reassign`,
      { executiveId, nextVisitDueAt },
    );
    return response.data;
  },

  schedule: async (assignmentId: string, nextVisitDueAt: string) => {
    const response = await api.patch<LandInspectionAssignment>(
      `/admin/land-inspection-assignments/${assignmentId}/schedule`,
      { nextVisitDueAt },
    );
    return response.data;
  },

  getAssignments: async (params: {
    page?: number;
    limit?: number;
    executiveId?: string;
    landId?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get<LandInspectionAssignmentsResponse>(
      "/admin/land-inspection-assignments",
      { params },
    );
    return response.data;
  },
};

// Land Visit Types (GPS-verified inspection visit + admin review)
export interface VisitPhoto {
  id: string;
  category: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  capturedAt: string;
  createdAt: string;
}

export interface LandVisitTableRow {
  id: string;
  landId: string;
  landCode: string | null;
  executiveId: string;
  executiveName: string;
  visitDate: string;
  photoCount: number;
  status: string;
  reviewStatus: string;
}

export interface LandVisitsResponse {
  data: LandVisitTableRow[];
  meta: PaginationMeta;
}

export interface LandVisitDetail {
  id: string;
  landId: string;
  landCode: string | null;
  ownerName: string;
  executiveId: string;
  executiveName: string;
  status: string;
  startedAt: string;
  startLatitude: number;
  startLongitude: number;
  startDistanceMeters: number;
  encroachment: boolean | null;
  boundaryCondition: string | null;
  illegalConstruction: boolean | null;
  remarks: string | null;
  submittedAt: string | null;
  reviewStatus: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  adminReviewNotes: string | null;
  photos: VisitPhoto[];
}

export const landVisitsApi = {
  getVisits: async (params: {
    page?: number;
    limit?: number;
    executiveId?: string;
    landId?: string;
    status?: string;
    reviewStatus?: string;
  }) => {
    const response = await api.get<LandVisitsResponse>("/admin/land-visits", {
      params,
    });
    return response.data;
  },

  getVisitById: async (id: string) => {
    const response = await api.get<LandVisitDetail>(
      `/admin/land-visits/${id}`,
    );
    return response.data;
  },

  reviewVisit: async (
    id: string,
    reviewStatus: "REVIEWED" | "FLAGGED",
    adminReviewNotes?: string,
  ) => {
    const response = await api.patch(`/admin/land-visits/${id}/review`, {
      reviewStatus,
      adminReviewNotes,
    });
    return response.data;
  },
};
