---
name: commit-helper
description: Helps generate standardized git commit messages following conventional commit format. Use when creating git commits or when the user mentions commits, git, or version control.
license: MIT
metadata:
  author: pochi-team
  version: "1.0"
allowed-tools: Bash(git:*) Read
---

# Git Commit Helper Skill

This skill helps generate standardized git commit messages following the conventional commit format.

## Usage

When called with arguments, analyze the provided context (git diff, staged changes, etc.) and generate appropriate commit messages.

## Format

Generate commit messages in this format:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Types
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools

## Examples
- `feat(auth): add OAuth2 login support`
- `fix(api): handle null response in user endpoint`
- `docs: update README with installation instructions`

## Instructions

1. First, run `git status` to see the current state
2. Run `git diff --cached` to see staged changes
3. Analyze the changes to determine the appropriate type and scope
4. Generate a concise, descriptive commit message
5. If the change is complex, include a body explaining the reasoning
6. Follow the 50/72 rule: 50 characters for subject, 72 for body lines