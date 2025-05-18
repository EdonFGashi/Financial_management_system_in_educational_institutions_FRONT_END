import { useEffect, useState } from "react";
import axios from "axios";
import { Porosia } from "../models/porosia.model";
import { urlPorosite } from "../endpoints";
import Swal from "sweetalert2";

export function usePorosite() {
  const [porosite, setPorosite] = useState<Porosia[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPorosite = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${urlPorosite}/paginated`, {
        params: { page: 1, pageSize: 1000 },
      });
      setPorosite(response.data.data);
    } catch (error) {
      Swal.fire("Gabim", "Nuk u arrit të merret lista e porosive", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPorosite(); }, []);

  return { porosite, loading };
}
