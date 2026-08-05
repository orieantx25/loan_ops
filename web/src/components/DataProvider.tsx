"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import fallbackStudents from "@/data/students.json";
import type { StudentsApiMeta, StudentsApiResponse } from "@/lib/studentsApiTypes";
import { POLL_INTERVAL_MS } from "@/lib/studentsApiTypes";
import type { RawStudent } from "@/lib/types";

const UPLOAD_STORAGE_KEY = "loan-dashboard-upload-override";

type DataContextValue = {
  students: RawStudent[];
  meta: StudentsApiMeta | null;
  warnings: string[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isUploadOverride: boolean;
  refresh: () => Promise<void>;
  setUploadOverride: (students: RawStudent[]) => void;
  clearUploadOverride: () => void;
};

const DataContext = createContext<DataContextValue | null>(null);

function formatMetaFromUpload(students: RawStudent[]): StudentsApiMeta {
  const needLoanYes = students.filter(
    (s) => String(s.loanRequired ?? "").trim().toLowerCase() === "yes",
  ).length;
  return {
    syncedAt: new Date().toISOString(),
    recordCount: students.length,
    needLoanYes,
    source: "upload",
    fresh: true,
  };
}

function loadUploadFromSession(): RawStudent[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UPLOAD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RawStudent[];
  } catch {
    return null;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<RawStudent[]>(
    fallbackStudents as RawStudent[],
  );
  const [meta, setMeta] = useState<StudentsApiMeta | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadOverride, setIsUploadOverride] = useState(false);
  const uploadActive = useRef(false);

  const applyResponse = useCallback((data: StudentsApiResponse) => {
    if (uploadActive.current) return;
    setStudents(data.students);
    setMeta(data.meta);
    setWarnings(data.warnings);
    setError(data.error?.message ?? null);
  }, []);

  const fetchLive = useCallback(
    async (isPoll = false) => {
      if (uploadActive.current) return;
      if (isPoll) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetch("/api/students", { cache: "no-store" });
        const data = (await res.json()) as StudentsApiResponse;
        applyResponse(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
        setWarnings((w) => [
          ...w,
          "Could not reach the server. Showing last available data.",
        ]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyResponse],
  );

  useEffect(() => {
    const uploaded = loadUploadFromSession();
    if (uploaded?.length) {
      uploadActive.current = true;
      setIsUploadOverride(true);
      setStudents(uploaded);
      setMeta(formatMetaFromUpload(uploaded));
      setWarnings(["Using uploaded file from this session."]);
      setLoading(false);
      return;
    }
    void fetchLive(false);
  }, [fetchLive]);

  useEffect(() => {
    if (isUploadOverride) return;
    const id = setInterval(() => void fetchLive(true), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchLive, isUploadOverride]);

  const setUploadOverride = useCallback((rows: RawStudent[]) => {
    uploadActive.current = true;
    setIsUploadOverride(true);
    setStudents(rows);
    setMeta(formatMetaFromUpload(rows));
    setWarnings(["Using uploaded file — live sheet polling paused."]);
    setError(null);
    sessionStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(rows));
  }, []);

  const clearUploadOverride = useCallback(() => {
    uploadActive.current = false;
    setIsUploadOverride(false);
    sessionStorage.removeItem(UPLOAD_STORAGE_KEY);
    void fetchLive(false);
  }, [fetchLive]);

  const value = useMemo(
    () => ({
      students,
      meta,
      warnings,
      loading,
      refreshing,
      error,
      isUploadOverride,
      refresh: () => fetchLive(true),
      setUploadOverride,
      clearUploadOverride,
    }),
    [
      students,
      meta,
      warnings,
      loading,
      refreshing,
      error,
      isUploadOverride,
      fetchLive,
      setUploadOverride,
      clearUploadOverride,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useStudentData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useStudentData must be used within DataProvider");
  return ctx;
}
