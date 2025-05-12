import { useState, useEffect } from "react";
import {urlListKomuna } from "../endpoints";
import { Komuna } from "../models/komuna.model";
import axiosInstance from "../api/axiosInstance";

export function useKomunaOptions() {
  const [options, setOptions] = useState<Komuna[]>([]);

  useEffect(() => {
    axiosInstance.get<Komuna[]>(urlListKomuna)
      .then(response => setOptions(response.data))
      .catch(err => console.error("Failed to load komuna list", err));
  }, []);

  return options;
}

