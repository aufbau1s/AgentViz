import { describe, expect, it } from "vitest";
import { createCli } from "./cli.js";

describe("agentviz CLI", () => {
  it("exposes the root command metadata", () => {
    const cli = createCli();

    expect(cli.name()).toBe("agentviz");
    expect(cli.description()).toBe("Track agent runs in a local Markdown registry.");
  });

  it("registers the planned M2 commands", () => {
    const commandNames = createCli().commands.map((command) => command.name());

    expect(commandNames).toEqual(["init", "new", "status", "lint", "export"]);
  });
});
