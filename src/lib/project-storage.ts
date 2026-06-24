// Local Storage based project management service

export interface AIProject {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "ai_app_generator_projects";

/**
 * Check if localStorage is available.
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error("localStorage unavailable:", error);
    return false;
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

/**
 * Load all projects
 */
export function loadProjects(): AIProject[] {
  if (!isStorageAvailable()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    return JSON.parse(raw) as AIProject[];
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

/**
 * Save all projects
 */
export function saveProjects(projects: AIProject[]): boolean {
  if (!isStorageAvailable()) return false;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(projects)
    );

    return true;
  } catch (error) {
    console.error("Failed to save projects:", error);
    return false;
  }
}

/**
 * Create project
 */
export function createProject(
  name: string,
  code: string,
  language: string = "tsx"
): AIProject | null {
  try {
    const now = Date.now();

    const project: AIProject = {
      id: generateId(),
      name,
      code,
      language,
      createdAt: now,
      updatedAt: now,
    };

    const projects = loadProjects();

    projects.unshift(project);

    const success = saveProjects(projects);

    return success ? project : null;
  } catch (error) {
    console.error("Create project failed:", error);
    return null;
  }
}

/**
 * Update project
 */
export function updateProject(
  id: string,
  updates: Partial<Pick<AIProject, "name" | "code" | "language">>
): AIProject | null {
  try {
    const projects = loadProjects();

    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: Date.now(),
    };

    saveProjects(projects);

    return projects[index];
  } catch (error) {
    console.error("Update failed:", error);
    return null;
  }
}

/**
 * Delete project
 */
export function deleteProject(id: string): boolean {
  try {
    const projects = loadProjects();

    const filtered = projects.filter((p) => p.id !== id);

    saveProjects(filtered);

    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
}

/**
 * Duplicate project
 */
export function duplicateProject(id: string): AIProject | null {
  try {
    const projects = loadProjects();

    const original = projects.find((p) => p.id === id);

    if (!original) return null;

    const now = Date.now();

    const duplicate: AIProject = {
      id: generateId(),
      name: `${original.name} (Copy)`,
      code: original.code,
      language: original.language,
      createdAt: now,
      updatedAt: now,
    };

    projects.unshift(duplicate);

    saveProjects(projects);

    return duplicate;
  } catch (error) {
    console.error("Duplicate failed:", error);
    return null;
  }
}

/**
 * Rename project
 */
export function renameProject(
  id: string,
  name: string
): AIProject | null {
  return updateProject(id, { name });
}

/**
 * Get single project
 */
export function getProject(id: string): AIProject | undefined {
  try {
    return loadProjects().find((p) => p.id === id);
  } catch {
    return undefined;
  }
}