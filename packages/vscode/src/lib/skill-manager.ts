import * as os from "node:os";
import * as path from "node:path";
import { getLogger } from "@getpochi/common";
import { parseSkillFile } from "@getpochi/common/tool-utils";
import type { SkillFile } from "@getpochi/common/vscode-webui-bridge";
import { signal } from "@preact/signals-core";
import { uniqueBy } from "remeda";
import { Lifecycle, injectable, scoped } from "tsyringe";
import * as vscode from "vscode";
// biome-ignore lint/style/useImportType: needed for dependency injection
import { WorkspaceScope } from "./workspace-scoped";

const logger = getLogger("SkillManager");

/**
 * Read skills from a directory
 */
async function readSkillsFromDir(dir: string): Promise<SkillFile[]> {
  const skills: SkillFile[] = [];
  try {
    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dir));
    for (const [fileName] of files) {
      if (fileName.endsWith(".md")) {
        const filePath = path.join(dir, fileName);
        const readFileContent = async (filePath: string): Promise<string> => {
          const fileContent = await vscode.workspace.fs.readFile(
            vscode.Uri.file(filePath),
          );
          return new TextDecoder().decode(fileContent);
        };
        const skill = await parseSkillFile(filePath, readFileContent);
        skills.push(skill);
      }
    }
  } catch (error) {
    // Directory may not exist, which is fine.
    logger.debug(`Could not read skills from directory ${dir}:`, error);
  }
  return skills;
}

@scoped(Lifecycle.ContainerScoped)
@injectable()
export class SkillManager implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];

  readonly skills = signal<SkillFile[]>([]);

  constructor(private readonly workspaceScope: WorkspaceScope) {
    this.initWatchers();
    this.loadSkills();
  }

  private get cwd() {
    return this.workspaceScope.cwd;
  }

  private initWatchers() {
    try {
      if (this.cwd) {
        const projectSkillsPattern = new vscode.RelativePattern(
          this.cwd,
          ".pochi/skills/**/*.md",
        );
        const projectWatcher =
          vscode.workspace.createFileSystemWatcher(projectSkillsPattern);

        projectWatcher.onDidCreate(() => this.loadSkills());
        projectWatcher.onDidChange(() => this.loadSkills());
        projectWatcher.onDidDelete(() => this.loadSkills());

        this.disposables.push(projectWatcher);
      }
    } catch (error) {
      logger.error("Failed to initialize project skills watcher", error);
    }

    try {
      // Watch system .pochi/skills directory
      const systemSkillsDir = path.join(os.homedir(), ".pochi", "skills");
      const systemSkillsPattern = new vscode.RelativePattern(
        systemSkillsDir,
        "**/*.md",
      );
      const systemWatcher =
        vscode.workspace.createFileSystemWatcher(systemSkillsPattern);

      systemWatcher.onDidCreate(() => this.loadSkills());
      systemWatcher.onDidChange(() => this.loadSkills());
      systemWatcher.onDidDelete(() => this.loadSkills());

      this.disposables.push(systemWatcher);
    } catch (error) {
      logger.error("Failed to initialize system skills watcher", error);
    }
  }

  private async loadSkills() {
    try {
      const allSkills: SkillFile[] = [];
      if (this.cwd) {
        const projectSkillsDir = path.join(this.cwd, ".pochi", "skills");
        const cwd = this.cwd;
        const projectSkills = await readSkillsFromDir(projectSkillsDir);
        allSkills.push(
          ...projectSkills.map((x) => ({
            ...x,
            filePath: path.relative(cwd, x.filePath),
          })),
        );
      }

      const systemSkillsDir = path.join(os.homedir(), ".pochi", "skills");
      const systemSkills = await readSkillsFromDir(systemSkillsDir);
      allSkills.push(
        ...systemSkills.map((x) => ({
          ...x,
          filePath: x.filePath.replace(os.homedir(), "~"),
        })),
      );

      this.skills.value = uniqueBy(allSkills, (skill) => skill.name);
      logger.debug(`Loaded ${allSkills.length} skills`);
    } catch (error) {
      logger.error("Failed to load skills", error);
      this.skills.value = [];
    }
  }

  dispose() {
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}