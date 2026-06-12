#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { runExport, runInit, runLint, runStatus } from "./commands.js";
import { errorMessage } from "./errors.js";
import { VERSION } from "./version.js";

export function createCli(): Command {
  const program = new Command();

  program
    .name("agentviz")
    .description("Track agent runs in a local Markdown registry.")
    .version(VERSION);

  program
    .command("init [workspace]")
    .description("Create an AgentViz agents/ workspace.")
    .action(async (workspace: string | undefined) => {
      process.exitCode = await handleCommand(() => runInit(workspace ?? "."));
    });

  program
    .command("new")
    .description("Create a new AgentViz run note.")
    .action(() => {
      console.log("agentviz new is not implemented yet.");
      process.exitCode = 1;
    });

  program
    .command("status [workspace]")
    .description("Summarize runs in an AgentViz workspace.")
    .action(async (workspace: string | undefined) => {
      process.exitCode = await handleCommand(() => runStatus(workspace ?? "."));
    });

  program
    .command("lint [workspace]")
    .description("Validate an AgentViz workspace.")
    .action(async (workspace: string | undefined) => {
      process.exitCode = await handleCommand(() => runLint(workspace ?? "."));
    });

  program
    .command("export [workspace]")
    .description("Export an AgentViz workspace.")
    .option("--json", "Emit JSON export.")
    .action(async (workspace: string | undefined, options: { json?: boolean }) => {
      process.exitCode = await handleCommand(() =>
        runExport(workspace ?? ".", options.json ?? false)
      );
    });

  return program;
}

async function handleCommand(command: () => Promise<number>): Promise<number> {
  try {
    return await command();
  } catch (error) {
    console.error(errorMessage(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createCli().parse(process.argv);
}
