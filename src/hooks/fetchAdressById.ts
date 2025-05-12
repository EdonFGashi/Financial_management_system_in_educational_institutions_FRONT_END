import axiosInstance from "../api/axiosInstance";
import { Adresa } from "../models/adresa.model";
import {urlListAdresa } from "../endpoints";

export async function fetchAddressById(id: string): Promise<Adresa | null> {
  try {
    const response = await axiosInstance.get<Adresa>(`${urlListAdresa}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch adresa by id", error);
    return null;
  }
}
