export interface CaseEntityCardDTO {
  id: number;
  name: string;
  address: string;
  education: string;
  work: string;
  status: string; // الحالة الاجتماعية
  category: string; // فئة الحالة (مثل: فقير، معاق، أرملة، يتيم، إلخ)
  familyCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  userId: string;
  userName: string;
  profileImageUrl?: string;
}

export interface CaseResponse {
  items: CaseEntityCardDTO[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CaseEntityAddDTO {
  name: string;
  ssnid: string;
  address: string;
  education: string;
  work: string;
  status: string; // الحالة الاجتماعية
  notes?: string; // ملاحظات إضافية
  need: string; // الاحتياجات الخاصة بالحالة (مثل: طعام، ملابس، علاج، تعليم، إلخ)
  category: string; // فئة الحالة (مثل: فقير، معاق، أرملة، يتيم، إلخ)
  userId: string;
}

export interface CaseEntityUpdateDTO {
  name: string;
  ssnid: string;
  address: string;
  education: string;
  work: string;
  status: string;
  notes?: string;
  need: string;
  category: string;
}


// Profile DTOs
export interface CaseEntityProfileDTO {
  id: number;
  name: string;
  ssnid: string;
  address: string;
  education: string;
  work: string;
  status: string;
  notes?: string;
  need: string;
  category: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  userId: string;
  userName: string;
  profileImageUrl?: string;
  houses: HouseCardDTO;
  families: FamilyCardDTO[];
  incomes: IncomeCardDTO[];
  phones: PhoneCardDTO[];
  aids: AidCardDTO[];
  images: ImageDTO[];
  spends: SpendCardDTO[];
}

export interface ImageDTO {
  id: number;
  imageUrl: string;
}

export interface HouseCardDTO {
  id: number;
  isRented: boolean;
  rentAmount?: number;
  notes?: string;
}

export interface FamilyCardDTO {
  id: number;
  name: string;
  ssnid: string;
  relation: string;
  education: string;
  work: string;
  status: string;
  notes?: string;
}

export interface IncomeCardDTO {
  id: number;
  value: number;
  notes?: string;
}

export interface PhoneCardDTO {
  id: number;
  phoneNumber: string;
}

export interface AidCardDTO {
  id: number;
  description: string;
  notes?: string;
  date: Date | string;
  caseEntityId: number;
  caseEntityName: string;
  userId: string;
  userName: string;
  profileImageUrl?: string;
}

export interface SpendCardDTO {
  id: number;
  value: number;
  notes?: string;
}

// Add DTOs for Profile Sections
export interface AidAddDTO {
  description: string;
  notes?: string;
  caseEntityId: number;
  userId: string;
}

export interface AidBulkAddDTO {
  caseEntityIds: number[];
  description: string;
  notes?: string;
  userId: string;
}

export interface AidResponse {
  items: AidCardDTO[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface FamiliesAddDTO {
  name: string;
  ssnid: string;
  relation: string;
  education: string;
  work: string;
  status: string;
  notes?: string;
}

export interface HouseAddDTO {
  isRented: boolean;
  rentAmount?: number;
  notes?: string;
  caseEntityId: number;
}

export interface IncomeAddDTO {
  value: number;
  notes?: string;
  caseEntityId: number;
}

export interface PhoneAddDTO {
  phoneNumber: string;
  caseEntityId: number;
}

export interface SpendAddDTO {
  value: number;
  notes?: string;
  caseEntityId: number;
}
