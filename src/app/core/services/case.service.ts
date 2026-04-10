import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { 
  CaseResponse, 
  CaseEntityAddDTO, 
  CaseEntityUpdateDTO,
  CaseEntityCardDTO, 
  CaseEntityProfileDTO,
  AidAddDTO,
  AidBulkAddDTO,
  AidResponse,
  FamiliesAddDTO,
  HouseAddDTO,
  IncomeAddDTO,
  PhoneAddDTO,
  SpendAddDTO
} from '../models/case.model';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private apiUrl = 'https://localhost:7000/api/CaseEntity';
  private aidApiUrl = 'https://localhost:7000/api/Aid';
  
  // Basic Cache for the first page
  private firstPageCache: CaseResponse | null = null;

  constructor(private http: HttpClient) {}

  getAll(
    pageNumber: number = 1, 
    pageSize: number = 10,
    filters: { name?: string, ssn?: string, phone?: string, category?: string, address?: string } = {}
  ): Observable<CaseResponse> {
    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(val => !!val);

    // Return cached data for the first page only if NO filters are active
    if (!hasActiveFilters && pageNumber === 1 && pageSize === 10 && this.firstPageCache) {
      return of(this.firstPageCache);
    }

    let params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (filters.name) params += `&name=${encodeURIComponent(filters.name)}`;
    if (filters.ssn) params += `&ssn=${encodeURIComponent(filters.ssn)}`;
    if (filters.phone) params += `&phone=${encodeURIComponent(filters.phone)}`;
    if (filters.category) params += `&category=${encodeURIComponent(filters.category)}`;
    if (filters.address) params += `&address=${encodeURIComponent(filters.address)}`;

    return this.http.get<CaseResponse>(`${this.apiUrl}${params}`).pipe(
      tap(res => {
        // Cache the first page only if NO filters are active
        if (!hasActiveFilters && pageNumber === 1 && pageSize === 10) {
          this.firstPageCache = res;
        }
      })
    );
  }

  getProfileById(id: number): Observable<CaseEntityProfileDTO> {
    return this.http.get<CaseEntityProfileDTO>(`${this.apiUrl}/profile/${id}`);
  }

  addCase(dto: CaseEntityAddDTO): Observable<CaseEntityCardDTO> {
    return this.http.post<CaseEntityCardDTO>(`${this.apiUrl}/AddCase`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateCaseEntity(id: number, dto: CaseEntityUpdateDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  uploadImage(id: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return this.http.post(`${this.apiUrl}/UploadImage/${id}`, formData);
  }

  addMember(id: number, member: FamiliesAddDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/addMember/${id}`, member);
  }

  addIncome(id: number, income: IncomeAddDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/addIncome/${id}`, income);
  }

  updateIncome(incomeId: number, dto: IncomeAddDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateIncome/${incomeId}`, dto);
  }

  deleteIncome(incomeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteIncome/${incomeId}`);
  }

  addPhone(id: number, phone: PhoneAddDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/addPhone/${id}`, phone);
  }

  updatePhone(phoneId: number, dto: PhoneAddDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatephone/${phoneId}`, dto);
  }

  deletePhone(phoneId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deletephone/${phoneId}`);
  }

  addHouse(id: number, house: HouseAddDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/addHouse/${id}`, house);
  }

  updateHouse(houseId: number, dto: HouseAddDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateHouse/${houseId}`, dto);
  }

  deleteHouse(houseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteHouse/${houseId}`);
  }

  addAid(id: number, aid: AidAddDTO): Observable<any> {
    return this.http.post(`${this.aidApiUrl}/addAid/${id}`, aid);
  }

  addAidBulk(dto: AidBulkAddDTO): Observable<any> {
    return this.http.post(`${this.aidApiUrl}/addAid/bulk`, dto);
  }

  updateAid(aidId: number, dto: AidAddDTO): Observable<any> {
    return this.http.put(`${this.aidApiUrl}/updateAid/${aidId}`, dto);
  }

  deleteAid(aidId: number): Observable<any> {
    return this.http.delete(`${this.aidApiUrl}/deleteAid/${aidId}`);
  }

  getAidsByUser(
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 20,
    filters: { caseName?: string; description?: string; dateFrom?: string; dateTo?: string } = {}
  ): Observable<AidResponse> {
    let params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (filters.caseName)    params += `&caseName=${encodeURIComponent(filters.caseName)}`;
    if (filters.description) params += `&description=${encodeURIComponent(filters.description)}`;
    if (filters.dateFrom)    params += `&dateFrom=${encodeURIComponent(filters.dateFrom)}`;
    if (filters.dateTo)      params += `&dateTo=${encodeURIComponent(filters.dateTo)}`;
    return this.http.get<AidResponse>(`${this.aidApiUrl}/myAids/${userId}${params}`);
  }

  getCountAidsByUser(userId: string): Observable<number> {
    return this.http.get<number>(`${this.aidApiUrl}/countmyAids/${userId}`);
  }

  addSpend(id: number, spend: SpendAddDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/addSpend/${id}`, spend);
  }

  updateSpend(spendId: number, dto: SpendAddDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatespend/${spendId}`, dto);
  }

  deleteSpend(spendId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteSpend/${spendId}`);
  }

  updateFamily(familyId: number, dto: FamiliesAddDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateFamilies/${familyId}`, dto);
  }

  deleteFamily(familyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteFamilies/${familyId}`);
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteImage/${imageId}`);
  }

  deleteCase(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  checkSSN(ssn: string): Observable<{ exists: boolean, message: string }> {
    return this.http.get<{ exists: boolean, message: string }>(`${this.apiUrl}/CheckSSN?ssn=${ssn}`);
  }

  checkPhone(phoneNumber: string): Observable<{ exists: boolean, message: string }> {
    return this.http.get<{ exists: boolean, message: string }>(`${this.apiUrl}/CheckPhone?phoneNumber=${phoneNumber}`);
  }

  // Method to clear cache if needed (e.g., after adding a new case)
  clearCache() {
    this.firstPageCache = null;
  }
}
