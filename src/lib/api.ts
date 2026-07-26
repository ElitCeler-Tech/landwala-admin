import api from "./axios";

// Types
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

// Users API
export const usersApi = {
  getUsers: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<UsersResponse>(
      `/admin/users?page=${page}&limit=${limit}`,
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
};

// Agent Types
export interface Agent {
  id: string;
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

// Agents API
export const agentsApi = {
  getAgents: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<AgentsResponse>(
      `/admin/agents?page=${page}&limit=${limit}`,
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
    const response = await api.patch<Agent>(`/admin/agents/${id}/approve-kyc`);
    return response.data;
  },

  rejectKyc: async (id: string) => {
    const response = await api.patch<Agent>(`/admin/agents/${id}/reject-kyc`);
    return response.data;
  },

  activateAgent: async (id: string) => {
    const response = await api.patch<Agent>(`/admin/agents/${id}/activate`);
    return response.data;
  },

  deactivateAgent: async (id: string) => {
    const response = await api.patch<Agent>(`/admin/agents/${id}/deactivate`);
    return response.data;
  },

  deleteAgent: async (id: string) => {
    await api.delete(`/admin/agents/${id}`);
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
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesResponse {
  data: Property[];
  meta: PaginationMeta;
}

// Properties API
export const propertiesApi = {
  getProperties: async (
    page: number = 1,
    limit: number = 10,
    isLatestListing?: boolean,
  ) => {
    const response = await api.get<PropertiesResponse>("/admin/properties", {
      params: { page, limit, isLatestListing },
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
  imageUrls?: string[];
  layoutUrl?: string | null;
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
  ) => {
    const response = await api.get<LandRegistrationsResponse>(
      "/admin/land-registrations",
      { params: { page, limit, userId } },
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
  ) => {
    const response = await api.get<LandProtectionsResponse>(
      "/admin/land-protections",
      { params: { page, limit, status, userId } },
    );
    return response.data;
  },

  getLandProtectionById: async (id: string) => {
    const response = await api.get<LandProtection>(
      `/admin/land-protections/${id}`,
    );
    return response.data;
  },

  sendLandProtectionQuote: async (id: string, quotedAmount: number) => {
    const response = await api.patch<LandProtection>(
      `/admin/land-protections/${id}/quote`,
      { quotedAmount },
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
};

// Enquiry Types
export interface EnquiryUser {
  id: string;
  email: string;
  phone: string;
  countryCode: string;
  name: string;
  profilePicture: string | null;
  location: string;
  employment: string;
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
  getEnquiries: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<EnquiriesResponse>(
      `/admin/enquiries?page=${page}&limit=${limit}`,
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
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  data: Report[];
  meta: PaginationMeta;
}

// Reports API
export const reportsApi = {
  getReports: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<ReportsResponse>(
      `/admin/issue-reports?page=${page}&limit=${limit}`,
    );
    return response.data;
  },
  getReportById: async (id: string) => {
    const response = await api.get<{ data: Report }>(
      `/admin/issue-reports/${id}`,
    );
    return response.data.data;
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

export interface ListingRequest {
  id: string;
  agentId: string;
  propertyId: string;
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
    const response = await api.get<{ data: ListingRequest }>(
      `/admin/listing-requests/${id}`,
    );
    return response.data.data;
  },
};

// Sub Admins Types
export interface SubAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
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
}

// Sub Admins API
export const subAdminsApi = {
  getSubAdmins: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<SubAdminsResponse>(
      `/admin/sub-admins?page=${page}&limit=${limit}`,
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

  updateSubAdminPermissions: async (id: string, permissions: string[]) => {
    const response = await api.patch<SubAdmin>(
      `/admin/sub-admins/${id}/permissions`,
      { permissions },
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
    const response = await api.get<{ data: SubscriptionPlan }>(
      `/admin/subscription-plans/${id}`,
    );
    return response.data;
  },

  createSubscriptionPlan: async (data: CreateSubscriptionPlanPayload) => {
    const response = await api.post<{ data: SubscriptionPlan }>(
      "/admin/subscription-plans",
      data,
    );
    return response.data;
  },

  updateSubscriptionPlan: async (
    id: string,
    data: UpdateSubscriptionPlanPayload,
  ) => {
    const response = await api.patch<{ data: SubscriptionPlan }>(
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
  ) => {
    const response = await api.get<PropertySubmissionsResponse>(
      "/admin/property-submissions",
      { params: { page, limit, status } },
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
  ) => {
    const response = await api.get<SubscriptionPurchasesResponse>(
      "/admin/subscription-purchases",
      { params: { page, limit, status } },
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
  ) => {
    const response = await api.get<GenericPaymentsResponse>(
      "/admin/payments",
      { params: { page, limit, status } },
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
