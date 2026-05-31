#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { VERSION } from "./version.js";

export function createCli(): Command {
  const program = new Command();

  program
    .name("agentviz")
    .description("Track agent runs in a local Markdown registry.")
    .version(VERSION);

  program
    .command("init")
    .description("Create an AgentViz agents/ workspace.")
    .action(() => {
      console.log("agentviz init is not implemented yet.");
      process.exitCode = 1;
    });

  program
    .command("new")
    .description("Create a new AgentViz run note.")
    .action(() => {
      console.log("agentviz new is not implemented yet.");
      process.exitCode = 1;
    });

  program
    .command("status")
    .description("Summarize runs in an AgentViz workspace.")
    .action(() => {
      console.log("agentviz status is not implemented yet.");
      process.exitCode = 1;
    });

  return program;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createCli().parse(process.argv);
}
