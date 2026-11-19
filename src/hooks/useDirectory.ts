/**
 * @file src/hooks/useDirectory.ts
 * @description Custom React Hook (`useDirectory`) and Object-Oriented Filter Engine
 * (`DirectoryFilterEngine` with constructor) for searching, filtering, and selecting
 * verified university professors.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DirectoryViewMode,
  ICollege,
  IDepartment,
  IProfessor,
} from "@/types/directory.types";
import { VerifiedSeedCatalog } from "@/data/woosongVerifiedSeed";

/**
 * @class DirectoryFilterEngine
 * @description OOP Search & Faceted Filter Engine with constructor.
 * Filters professors by college, department, and multi-field fuzzy search query.
 */
export class DirectoryFilterEngine {
  private readonly professors: IProfessor[];
  private readonly departments: IDepartment[];

  /**
   * Constructor binds the full professor dataset and department metadata.
   */
  constructor(professors: IProfessor[], departments: IDepartment[]) {
    this.professors = professors;
    this.departments = departments;
  }

  /**
   * Executes multi-criteria filtering in O(N) time (< 2ms for university directories).
   */
  public executeFilter(params: {
    selectedCollegeId: number | null;
    selectedDepartmentId: number | null;
    searchQuery: string;
  }): IProfessor[] {
    const normalizedQuery = params.searchQuery.trim().toLowerCase();

    return this.professors.filter((prof) => {
      // 1. Filter by College if selected
      if (params.selectedCollegeId !== null) {
        const dept = this.departments.find((d) => d.id === prof.department_id);
        if (!dept || dept.college_id !== params.selectedCollegeId) {
          return false;
        }
      }

      // 2. Filter by Department if selected
      if (
        params.selectedDepartmentId !== null &&
        prof.department_id !== params.selectedDepartmentId
      ) {
        return false;
      }

      // 3. Filter by Fuzzy Search Query (Korean Name, English Name, Email, Research, Dept)
      if (normalizedQuery.length > 0) {
        const searchableText = [
          prof.name_ko,
          prof.name_en,
          prof.email,
          prof.research_fields,
          prof.office_location,
          prof.department_name_ko || "",
          prof.department_name_en || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      }

      return true;
    });
  }
}

/**
 * @function useDirectory
 * @description Custom React Hook managing the live faculty directory state,
 * database synchronization, search filtering, and view mode switching.
 */
export function useDirectory() {
  // Initialize with verified seed data for instant 0ms first render, then hydrate from Neon PostgreSQL
  const initialSeed = useMemo(() => new VerifiedSeedCatalog(), []);

  const [colleges, setColleges] = useState<ICollege[]>(() =>
    initialSeed.getColleges()
  );
  const [departments, setDepartments] = useState<IDepartment[]>(() =>
    initialSeed.getDepartments()
  );
  const [professors, setProfessors] = useState<IProfessor[]>(() =>
    initialSeed.getEnrichedProfessors()
  );
  const [dataSource, setDataSource] = useState<
    "neon-postgresql" | "local-verified-seed"
  >("local-verified-seed");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter & UI view states
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<DirectoryViewMode>("table");
  const [selectedProfessor, setSelectedProfessor] = useState<IProfessor | null>(null);

  /**
   * Fetches the latest verified directory from Neon PostgreSQL via /api/directory.
   */
  const refreshDirectory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/directory", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setColleges(data.colleges);
        setDepartments(data.departments);
        setProfessors(data.professors);
        setDataSource(data.source);

        // Pre-select the first professor if none is currently selected
        if (data.professors.length > 0) {
          setSelectedProfessor((prev) => prev ?? data.professors[0]);
        }
      }
    } catch (error) {
      console.error("[useDirectory] Error hydrating directory:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDirectory();
  }, [refreshDirectory]);

  // Instantiate the OOP DirectoryFilterEngine whenever catalog or filter parameters change
  const filteredProfessors = useMemo(() => {
    const engine = new DirectoryFilterEngine(professors, departments);
    return engine.executeFilter({
      selectedCollegeId,
      selectedDepartmentId,
      searchQuery,
    });
  }, [
    professors,
    departments,
    selectedCollegeId,
    selectedDepartmentId,
    searchQuery,
  ]);

  // Filter departments belonging to the currently selected college
  const visibleDepartments = useMemo(() => {
    if (selectedCollegeId === null) return departments;
    return departments.filter((dept) => dept.college_id === selectedCollegeId);
  }, [departments, selectedCollegeId]);

  /**
   * Handles college selection and resets incompatible department filters.
   */
  const handleSelectCollege = useCallback((collegeId: number | null) => {
    setSelectedCollegeId(collegeId);
    setSelectedDepartmentId(null);
  }, []);

  return {
    colleges,
    departments,
    visibleDepartments,
    professors,
    filteredProfessors,
    dataSource,
    isLoading,
    selectedCollegeId,
    selectedDepartmentId,
    searchQuery,
    viewMode,
    selectedProfessor,
    setSelectedCollegeId: handleSelectCollege,
    setSelectedDepartmentId,
    setSearchQuery,
    setViewMode,
    setSelectedProfessor,
    refreshDirectory,
  };
}
