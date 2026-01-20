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
export const dashboardApi = {
  getDashboard: async () => {
    const response = await api.get<DashboardData>("/admin/dashboard");
    return response.data;
  },
};

// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  countryCode: string;
  name: string;
  profilePicture: string | null;
  location: string;
  employment: string;
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
  getProperties: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PropertiesResponse>(
      `/admin/properties?page=${page}&limit=${limit}`,
    );
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
  user: {
    id: string;
    email: string;
    phone: string;
    name: string;
    location?: string;
    employment?: string;
  };
  status: string;
  fullName: string;
  phone: string;
  landLocation: string;
  landArea: string;
  location: string;
  createdAt: string;
}

export interface LandProtectionsResponse {
  data: LandProtection[];
  meta: PaginationMeta;
}

// User Action APIs
export const userActionsApi = {
  getLoanApplications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LoanApplicationsResponse>(
      `/admin/loan-applications?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getLegalVerifications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LegalVerificationsResponse>(
      `/admin/legal-verifications?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getLandRegistrations: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LandRegistrationsResponse>(
      `/admin/land-registrations?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getLandProtections: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<LandProtectionsResponse>(
      `/admin/land-protections?page=${page}&limit=${limit}`,
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
