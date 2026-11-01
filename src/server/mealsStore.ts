/// <reference types="node" />
// Server-only persistence used by the API routes in src/app/api. A JSON file
// stands in for a real database in this demo.

import type { Meal } from "@/types/meal";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_FILE = path.join(process.cwd(), ".data", "meals.json");

export async function readMeals(): Promise<Meal[]> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8")) as Meal[];
  } catch {
    return [];
  }
}

export async function writeMeals(meals: Meal[]): Promise<Meal[]> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(meals, null, 2));
  return meals;
}
