# Cline Memory Bank Setup Guide

This guide explains how to set up and use the Cline Memory Bank system for maintaining project context with Cline, integrated with Dart for task management and Git for version control.

## Purpose

The Memory Bank provides Cline with a persistent knowledge base about your project, allowing it to retain context between sessions and act as an effective development partner. Cline reads these files at the start of each task to understand the project's state, goals, and history.

## Core Files

Create these files within a `.clinerules/memory-bank/` directory in your project root:

1.  **`projectbrief.md`**: High-level project name, goals, and core functionality. The foundation.
2.  **`productContext.md`**: The "why" - problem solved, target user, core user experience, key features.
3.  **`activeContext.md`**: Tracks the immediate state - current focus, recent changes, next steps, decisions, learnings, key patterns/preferences. _Updated frequently._
4.  **`systemPatterns.md`**: Documents architecture, key technical decisions, design patterns, component relationships.
5.  **`techContext.md`**: Details the tech stack, setup, constraints, dependencies, tool usage (linting, testing commands).
6.  **`progress.md`**: Tracks project status - what works, what's left (with Dart Task IDs), overall status, known issues, decision log. _Updated frequently._

_(Initial templates for these files can be found in the `expo-interview-prep` project or the official Cline docs.)_

## Workflow Integration (Cline + Dart + Git)

This setup uses the Memory Bank as the primary context source, Dart for task tracking, and Git for version control.

1.  **Task Start:** Cline reads all core Memory Bank files.
2.  **Context:** Cline uses the files, especially `activeContext.md` and `progress.md`, to understand the current state. Cline may also query Dart (`list_tasks`) for supplementary status if needed.
3.  **Identifying New Tasks:**
    - New tasks are discussed and defined.
    - Cline updates `progress.md` (adding to "What's Left") and `activeContext.md` ("Next Steps").
    - Cline proposes creating a task in Dart (`create_task`), asking for approval.
    - Once approved and created, Cline updates `progress.md` with the Dart Task ID.
4.  **Working on Tasks:**
    - **Branching:** Cline proposes a branch name following conventions (e.g., `feat/TASKID-description`) and asks for approval before executing `git checkout -b`.
    - **Implementation:** Cline performs coding tasks, potentially updating `activeContext.md` with learnings or decisions.
5.  **Completing Tasks:**
    - Cline updates `activeContext.md` (summarizing changes) and `progress.md` (moving task status).
    - Cline proposes updating the corresponding Dart task (`update_task`), asking for approval.
    - The user handles the actual `git commit` process, ensuring commit messages include the relevant Dart Task ID.
6.  **Memory Bank Updates:** Updates occur automatically as tasks progress. Cline will ask clarifying questions before modifying files. Explicit `update memory bank` commands can be used but should be less frequent with this automated flow.
7.  **Proactive Thinking (Using `sequentialthinking`):**
    - **Trigger:** Cline will proactively use structured thinking (before/after tasks, when opportunities arise) to consider improvements, future steps, and architectural implications, referencing Memory Bank files.
    - **Priorities:** Focus is on 1) UX/Value, 2) Architecture/Scalability, 3) New Features, 4) Performance, 5) DevEx.
    - **Process:** Cline investigates ideas autonomously using `sequentialthinking`.
    - **Output:** Cline presents key conclusions, reasoning, and proposed plans/suggestions for discussion. Only the conclusions, not the full thought process, will typically be shown.
    - **Action:** Following user discussion/approval, Cline updates Memory Bank files and proposes relevant Dart tasks or Git actions.

## Initialization in a New Project

1.  Create the `.clinerules/memory-bank/` directory.
2.  Copy the template content for the six core markdown files (`projectbrief.md`, `productContext.md`, etc.) into this directory.
3.  (Optional) Add the Memory Bank Custom Instructions from the Cline docs to your global VS Code settings or a root `.clinerules` file if you want Cline to be explicitly aware of the system's rules.
4.  **Install `code2prompt-mcp` (Recommended):**
    - Ensure `rye` is installed (`curl -sSf https://rye.astral.sh/get | bash`).
    - Clone the repository: `git clone https://github.com/odancona/code2prompt-mcp.git` (e.g., into `~/Sites/`).
    - Install dependencies: `cd /path/to/code2prompt-mcp && source "$HOME/.rye/env" && rye build`.
    - Add the server configuration to your Cline MCP settings (`cline_mcp_settings.json` or `claude_desktop_config.json`), adjusting the paths as needed:
      ```json
      "code2prompt": {
        "command": "bash",
        "args": [
          "-c",
          "cd /path/to/code2prompt-mcp && source \"$HOME/.rye/env\" && rye run python /path/to/code2prompt-mcp/src/code2prompt_mcp/main.py"
        ],
          "env": {}
        }
      ```
    * **Usage Note:** When invoking the `code2prompt` MCP tool (e.g., `get_context`), Cline must provide the **absolute path** to the target directory or file, as relative paths may not resolve correctly from the server's execution context.
5.  Start your first task by asking Cline to review the initial Memory Bank files (especially `projectbrief.md`) and discuss the first steps.

This system provides a robust way for Cline to assist effectively in your projects by maintaining detailed, structured context integrated with your preferred project management tools. The `code2prompt` tool further enhances Cline's ability to understand code structure efficiently.
