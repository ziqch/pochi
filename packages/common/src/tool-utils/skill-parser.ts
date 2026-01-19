import * as path from "node:path";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import { matter } from "vfile-matter";
import z from "zod/v4";
import { toErrorMessage } from "../base";
import type {
  InvalidSkillFile,
  SkillFile,
  ValidSkillFile,
} from "../vscode-webui-bridge";

type VFile = Parameters<typeof matter>[0];

const SkillFrontmatter = z.object({
  name: z.string(),
  description: z.string(),
  license: z.string().optional(),
  compatibility: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  "allowed-tools": z.string().optional(),
});

export async function parseSkillFile(
  filePath: string,
  readFileContent: (filePath: string) => Promise<string>,
): Promise<SkillFile> {
  const defaultName = path.basename(filePath, path.extname(filePath));
  let content: string;
  try {
    content = await readFileContent(filePath);
  } catch (error) {
    return {
      name: defaultName,
      filePath,
      error: "readError",
      message: toErrorMessage(error),
    } satisfies InvalidSkillFile;
  }

  let vfile: VFile;
  try {
    vfile = await remark()
      .use(remarkFrontmatter, [{ type: "yaml", marker: "-" }])
      .use(() => (_tree, file) => matter(file))
      .process(content);
  } catch (error) {
    return {
      name: defaultName,
      filePath,
      error: "parseError",
      message: toErrorMessage(error),
    } satisfies InvalidSkillFile;
  }

  const instructions = vfile.value.toString().trim();

  if (!vfile.data.matter || Object.keys(vfile.data.matter).length === 0) {
    return {
      name: defaultName,
      filePath,
      error: "parseError",
      message: "No skill definition found in the frontmatter of the file.",
      instructions,
    } satisfies InvalidSkillFile;
  }

  const parseResult = SkillFrontmatter.safeParse(vfile.data.matter);
  if (!parseResult.success) {
    return {
      name: defaultName,
      filePath,
      error: "validationError",
      message: z.prettifyError(parseResult.error),
      instructions,
    } satisfies InvalidSkillFile;
  }

  const frontmatterData = parseResult.data;
  const skillName = frontmatterData.name || defaultName;

  // Validate that the skill name matches the directory name (if in a directory structure)
  const parentDir = path.basename(path.dirname(filePath));
  if (parentDir !== "." && parentDir !== "skills" && skillName !== parentDir) {
    return {
      name: defaultName,
      filePath,
      error: "validationError",
      message: `Skill name "${skillName}" must match parent directory name "${parentDir}"`,
      instructions,
    } satisfies InvalidSkillFile;
  }

  return {
    filePath,
    name: skillName,
    description: frontmatterData.description,
    license: frontmatterData.license,
    compatibility: frontmatterData.compatibility,
    metadata: frontmatterData.metadata,
    allowedTools: frontmatterData["allowed-tools"],
    instructions,
  } satisfies ValidSkillFile;
}
