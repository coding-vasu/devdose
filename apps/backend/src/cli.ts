#!/usr/bin/env node

import { Command } from "commander";
import { Discovery } from "./pipeline/discovery";
import { Extraction } from "./pipeline/extraction";
import { Processing } from "./pipeline/processing";
import { QualityScoring } from "./pipeline/quality";
import { Enrichment } from "./pipeline/enrichment";
import { Publishing } from "./pipeline/publishing";
import { Pipeline } from "./pipeline";

const program = new Command();

program
  .name("devdose-pipeline")
  .description("DevDose content pipeline CLI")
  .version("1.0.0");

// Run full pipeline
program
  .command("run")
  .description("Run the complete 6-stage pipeline")
  .action(async () => {
    const pipeline = new Pipeline();
    await pipeline.run();
  });

// Run individual stages
program
  .command("discovery")
  .description("Run Stage 1: Discovery")
  .action(async () => {
    const discovery = new Discovery();
    const result = await discovery.run();
    await discovery.saveResults(result, "discovery-results.json");
  });

program
  .command("extraction")
  .description("Run Stage 2: Extraction")
  .action(async () => {
    const extraction = new Extraction();
    const result = await extraction.run("discovery-results.json");
    await extraction.saveResults(result, "extraction-results.json");
  });

program
  .command("processing")
  .description("Run Stage 3: Processing")
  .action(async () => {
    const processing = new Processing();
    const result = await processing.run("extraction-results.json");
    await processing.saveResults(result, "processing-results.json");
  });

program
  .command("quality")
  .description("Run Stage 4: Quality Scoring")
  .action(async () => {
    const quality = new QualityScoring();
    const result = await quality.run("processing-results.json");
    await quality.saveResults(result, "quality-results.json");
  });

program
  .command("enrichment")
  .description("Run Stage 5: Enrichment")
  .action(async () => {
    const enrichment = new Enrichment();
    const result = await enrichment.run("quality-results.json");
    await enrichment.saveResults(result, "enrichment-results.json");
  });

program
  .command("publishing")
  .description("Run Stage 6: Publishing")
  .action(async () => {
    const publishing = new Publishing();
    await publishing.run("enrichment-results.json");
  });

program.parse();
