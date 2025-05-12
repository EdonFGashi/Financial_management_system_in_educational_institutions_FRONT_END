import axiosInstance from "../api/axiosInstance";
import { Person } from "../models/person.model";
import {urlListPerson } from "../endpoints";

export async function fetchPersonByNrPersonal(nrPersonal: string): Promise<Person | null> {
  try {
    const response = await axiosInstance.get<Person>(`${urlListPerson}/${nrPersonal}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch person by personal number", error);
    return null;
  }
}
