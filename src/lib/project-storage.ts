// Local Storage based project management service
// Keeps projects in memory/browser for persistence across sessions

export interface AIProject {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "ai_app_generator_projects";

export function loadProjects(): AIProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: AIProject[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name: string, code: string, language: string = "tsx"): AIProject {
  const now = Date.now();
  const project: AIProject = {
    id: crypto.randomUUID(),
    name,
    code,
    language,
    createdAt: now,
    updatedAt: now,
  };
  const projects = loadProjects();
  projects.unshift(project);
  saveProjects(projects);
  return project;
}

export function updateProject(id: string, updates: Partial<Pick<AIProject, "name" | "code" | "language">>): AIProject | null {
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
}

export function deleteProject(id: string): boolean {
  const projects = loadProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
}

export function duplicateProject(id: string): AIProject | null {
  const projects = loadProjects();
  const original = projects.find((p) => p.id === id);
  if (!original) return null;

  const now = Date.now();
  const duplicate: AIProject = {
    id: crypto.randomUUID(),
    name: original.name + " (Copy)",
    code: original.code,
    language: original.language,
    createdAt: now,
    updatedAt: now,
  };
  projects.unshift(duplicate);
  saveProjects(projects);
  return duplicate;
}

export function renameProject(id: string, name: string): AIProject | null {
  return updateProject(id, { name });
}

export function getProject(id: string): AIProject | undefined {
  return loadProjects().find((p) => p.id === id);
}