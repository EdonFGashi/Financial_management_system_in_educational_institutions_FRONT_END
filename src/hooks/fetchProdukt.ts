import { useEffect, useState,useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { Produkti } from "../models/produkte.model";
import { urlProdukte } from "../endpoints";

// hooks/fetchProdukt.ts
export function useProdukte() {
  const [produkte, setProdukte] = useState<Produkti[]>([]);

  const refetchProdukte = useCallback(() => {
    axiosInstance
      .get(`${urlProdukte}/paginated`)
      .then((response) => {
        const list = response.data.data || response.data || [];
        setProdukte(list);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  useEffect(() => {
    refetchProdukte();
  }, [refetchProdukte]);

  return [produkte, setProdukte, refetchProdukte] as const;
}
