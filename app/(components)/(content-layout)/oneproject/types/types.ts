import {
  ProjectStatus,
  TaskStatus,
  Role,
  RoleProject,
  Payment as IPayment,
  User,
  File,
  Project,
  LeadStatus,
  LeadSource,
  CrmPriority,
  CrmDealStatus,
} from "@prisma/client";

export type DealProps = {
  title: string;
  value?: number;
  currency?: string;
  commissionRate?: number;
  commissionAmount?: number;
  status?: CrmDealStatus;
  tags?: string[];
  expectedCloseDate?: any;
  pipelineId: string;
  stageId: string;
  leadId?: string;
  // ERP scalar bağlar
  agencyId: string;
  agentId?: string;
  clientId?: string;
  listingId?: string;
  propertyId?: string;
  ownerUserId?: string;
};

export type LeadProps = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: CrmPriority;
  score?: number;
  tags?: string[];
  // Talep kriterleri
  interestType?: string; // ERP ListingType (SALE/RENT/SHORT_RENT)
  propertyType?: string; // ERP PropertyType (APARTMENT, VILLA, LAND ...)
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  preferredCities?: string[];
  roomCount?: string;
  description?: string;
  // ERP scalar bağlar
  agencyId: string;
  agentId?: string;
  listingId?: string;
  propertyId?: string;
  ownerUserId?: string;
  convertedClientId?: string;
};

export type CategoryProps = {
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
  agencyId?: string;
  propertyType?: string; // ERP PropertyType enum değeri (APARTMENT, VILLA, LAND ...)
  listingType?: string; // ERP ListingType enum değeri (SALE, RENT, SHORT_RENT)
};
export interface ProjectWithPayment extends Project {
  payments: IPayment[];
}
export type UserProps = {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  username:string;
  image: string;
  email: string;
  password: string;
  role?: Role;
  roleproject?: RoleProject; // ERP/oneproject kullanıcı rolü (USER, ADMIN, CLIENT, MEMBER)
  userLogo?: string;
  userId?: string;
  country?: string;
  location?: string;
  companyName?: string;
  companyDescription?: string;
  clientType?: string; // "ALICI" | "SATICI" | "KIRACI" | "MULK_SAHIBI"
};
export type PaymentProps = {
  amount: number;
  // amountLocal: number;
  tax: number;
  date: string;
  title: string;
  invoiceNumber: string;
  method: string;
  projectId: string;
  userId: string;
  clientId: string;
  // Gayrimenkul komisyon alanları
  transactionType?: string;
  commissionRate?: number;
  commissionAmount?: number;
};
export type CommentProps = {
  content: string;
  projectId: string;
  userName: string;
  userRole: Role;
  userId: string;
};
export type ProjectProps = {
  name: string;
  slug: string;
  notes: string;
  description: string;
  bannerImage: string;
  gradient: string;
  thumbnail: string;
  freeDomain: string;
  customDomain: string;
  startDate: any;
  endDate: any;
  status: ProjectStatus;
  clientId: string; // ERP PropertyClient.id
  userId: string;
  budget: number;
  budgetLocal: number;
  deadline: number;
  // ERP (Gayrimenkul) bağlantıları — emlak detayları bağlı ilandan/mülkten gelir
  agencyId?: string;
  agentId?: string;
  listingId?: string;
  propertyId?: string;
};
export type LoginProps = {
  email: string;
  password: string;
};

export type ProjectData = {
  id: string;
  name: string;
  slug: string;
  notes: string | null;
  description: string | null;
  bannerImage: string | null;
  gradient: string | null;
  freeDomain: string | null;
  customDomain: string | null;
  thumbnail: string | null;
  budget: number | null;
  budgetLocal: number | null;
  deadline: number | null;
  startDate: Date;
  endDate: Date | null;
  status: ProjectStatus;
  // ERP (Gayrimenkul) bağlantıları
  agencyId: string | null;
  agentId: string | null;
  listingId: string | null;
  propertyId: string | null;
  clientId: string;
  userId: string;
  modules: Module[];
  comments: ProjectComment[];
  members: Member[];
  invoices: Invoice[];
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
  client: any | null;
  listing?: any | null;
  property?: any | null;
  user: User;
};
export type ProjectWithUser = {
  id: string;
  name: string;
  slug: string;
  notes: string | null;
  description: string | null;
  bannerImage: string | null;
  gradient: string | null;
  thumbnail: string | null;
  budget: number | null;
  deadline: number | null;
  startDate: Date;
  endDate: Date | null;
  status: ProjectStatus;
  clientId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  // ERP (Gayrimenkul) bağlı ilan/mülk — enrichProjects ile eklenir (vitrinde fiyat/konum gösterimi)
  listing?: {
    id: string;
    title: string;
    listingType: string;
    askingPrice: number;
    currency: string;
  } | null;
  property?: {
    id: string;
    title: string;
    city: string;
    district: string;
    propertyType: string;
  } | null;
};
export type ProjectWithPayments = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  payments: Payment[];
};
export type DetailedUserProjects = ProjectWithPayments[];
export type moduleData = {
  id: string;
  name: string;
  userName: string;
  userId: string;
  projectId: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
};

export type Module = {
  id: string;
  name: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
};
export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectComment = {
  id: string;
  content: string;
  projectId: string;
  userName: string;
  userRole: Role;
  createdAt: Date;
  updatedAt: Date;
};
export type ModuleProps = {
  name: string;
  userName: string;
  userId: string;
  projectId: string;
};
export type TaskProps = {
  title: string;
  status: TaskStatus;
  moduleId: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceDetails = {
  invoice: IPayment;
  user: IUser | null;
  client: IClient | null;
};
interface IUser {
  name: string;
  phone: string;
  email: string;
  companyName: string;
  companyDescription: string;
  userLogo: string;
}
interface IClient {
  name: string;
  phone: string;
  email: string;
  companyName: string;
  companyDescription: string;
}

export type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date;
  projectId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: string;
  amount: number;
  tax: number;
  date: Date;
  title: string;
  method: string;
  projectId: string;
  userId: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
  invoiceNumber: string;
  // Gayrimenkul komisyon/işlem alanları (ERP estate üstüne)
  transactionType: string | null;
  commissionRate: number | null;
  commissionAmount: number | null;
};

export type ClientData = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  image: string | null;
  country: string | null;
  location: string | null;
  role: Role;
  plain: string | null;
  companyName: string | null;
  companyDescription: string | null;
};

export type PortfolioProps = {
  userId: string;
  agencyId?: string;
  agentId?: string; // ERP Agent.id (vitrin sahibi danışman)
  name: string;
  profileImage: string;
  location: string;
  projectCount: number;
  email: string;
  bookingLink: string;
  description: string;
  twitterUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  githubUrl: string;
};

export interface FolderProps {
  name: string;
  userId: string;
  agencyId?: string;
}
export interface FileProps {
  name: string;
  type: string;
  url: string;
  size: number;
  folderId: string;
}
export interface UserFolder {
  id: string;
  name: string;
  userId: string;
  files: File[];
  createdAt: Date;
}
