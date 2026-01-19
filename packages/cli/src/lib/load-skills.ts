import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { getLogger } from "@getpochi/common";
import { isFileExists, parseSkillFile } from "@getpochi/common/tool-utils";
import type {
  SkillFile,
  ValidSkillFile,
} from "@getpochi/common/vscode-webui-bridge";
import { isValidSkill } from "@getpochi/common/vscode-webui-bridge";
import { uniqueBy } from "remeda";

const logger = getLogger("loadSkills");

/**
 * Read skills from a directory
 */
async function readSkillsFromDir(dir: string): Promise<SkillFile[]> {
  const skills: SkillFile[] = [];
  try {
    if (!(await isFileExists(dir))) {
      return skills;
    }

    const files = await fs.readdir(dir);
    for (const fileName of files) {
      if (fileName.endsWith(".md")) {
        const filePath = path.join(dir, fileName);
        const readFileContent = async (filePath: string) =>
          await fs.readFile(filePath, "utf-8");
        const skill = await parseSkillFile(filePath, readFileContent);
        skills.push({ ...skill, filePath });
      }
    }
  } catch (error) {
    // Directory may not exist, which is fine.
    logger.debug(`Could not read skills from directory ${dir}:`, error);
  }
  return skills;
}

export async function loadSkills(
  workingDirectory?: string,
  includeSystemSkills = true,
): Promise<ValidSkillFile[]> {
  try {
    const allSkills: SkillFile[] = [];

    // Load project skills if working directory is provided
    if (workingDirectory) {
      const projectSkillsDir = path.join(workingDirectory, ".pochi", "skills");
      const projectSkills = await readSkillsFromDir(projectSkillsDir);
      allSkills.push(
        ...projectSkills.map((x) => ({
          ...x,
          filePath: path.relative(workingDirectory, x.filePath),
        })),
      );
    }

    // Load system skills
    if (includeSystemSkills) {
      const systemSkillsDir = path.join(os.homedir(), ".pochi", "skills");
      const systemSkills = await readSkillsFromDir(systemSkillsDir);
      allSkills.push(
        ...systemSkills.map((x) => ({
          ...x,
          filePath: x.filePath.replace(os.homedir(), "~"),
        })),
      );
    }

    // Filter out invalid skills for CLI usage
    const validSkills = uniqueBy(allSkills, (skill) => skill.name).filter(
      (skill): skill is ValidSkillFile => {
        if (isValidSkill(skill)) {
          return true;
        }
        logger.warn(
          `Ignoring invalid skill file ${skill.filePath}: [${skill.error}] ${skill.message}`,
        );
        return false;
      },
    );

    logger.debug(
      `Loaded ${allSkills.length} skills (${validSkills.length} valid, ${allSkills.length - validSkills.length} invalid)`,
    );
    return validSkills;
  } catch (error) {
    logger.error("Failed to load skills", error);
    return [];
  }
}