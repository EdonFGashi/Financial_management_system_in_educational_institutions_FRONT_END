import axiosInstance from "../api/axiosInstance";
import { urlOretShtese } from "../endpoints";

export interface OretShteseDto {
  id: number;
  stafiShkollesId: number;
  stafiShkolles?: {
    id: number;
    numriPersonal: number;
    person: {
      emri?: string;
      mbiemri?: string;
    } | null;
    pozita: string;
    paga: number;
  };
  emri?: string;
  mbiemri?: string;
  punetoriEmri?: string;
  punetoriMbiemri?: string;
  shkollaEmri: string;
  dataAngazhimit: string;
  nrOreve: number;
  pagesaPerOre: number;
  totalKosto: number;
  shenime: string;
  statusi: "pritje" | "aprovuar" | "refuzuar";
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateOretShteseDto {
  dataAngazhimit?: Date;
  nrOreve?: number;
  pagesaPerOre?: number;
  shenime?: string;
  statusi?: string;
}

export interface PaginationDTO {
  page: number;
  recordsPerPage: number;
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  succeeded?: boolean; // Add this property for compatibility
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  recordsPerPage: number;
  totalRecords: number;
  totalPages: number;
  message: string;
  succeeded: boolean; // Changed from isSuccess to succeeded
  statusCode: number;
}

const oretShteseService = {
  // Get all overtime records with pagination
  getAllOretShtese: async (page = 1, recordsPerPage = 100): Promise<PaginatedResponse<OretShteseDto>> => {
    try {
      console.log("Fetching overtime records with:", { page, recordsPerPage });
      const response = await axiosInstance.get(`${urlOretShtese}/paginated`, {
        params: {
          Page: page, // API expects uppercase parameter names
          RecordsPerPage: recordsPerPage
        }
      });
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching overtime records:', error);
      throw error;
    }
  },

  // Get a specific overtime record by ID
  getOretShteseById: async (id: number): Promise<ApiResponse<OretShteseDto>> => {
    try {
      const response = await axiosInstance.get(`${urlOretShtese}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching overtime record with ID ${id}:`, error);
      throw error;
    }
  },

  // Update the status of an overtime record (approve/reject)
  updateOretShtese: async (id: number, data: UpdateOretShteseDto): Promise<ApiResponse<boolean>> => {
    try {
      const response = await axiosInstance.put(`${urlOretShtese}/${id}`, data);
      // Ensure both properties exist for backwards compatibility
      if (response.data.isSuccess !== undefined && response.data.succeeded === undefined) {
        response.data.succeeded = response.data.isSuccess;
      } else if (response.data.succeeded !== undefined && response.data.isSuccess === undefined) {
        response.data.isSuccess = response.data.succeeded;
      }
      return response.data;
    } catch (error) {
      console.error(`Error updating overtime record with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an overtime record (if needed)
  deleteOretShtese: async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      const response = await axiosInstance.delete(`${urlOretShtese}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting overtime record with ID ${id}:`, error);
      throw error;
    }
  }
};

export default oretShteseService;
