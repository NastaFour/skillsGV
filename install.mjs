#!/usr/bin/env node
/**
 * Quick entry point for installing skills across AI agents and projects.
 * 
 * Examples:
 *   node install.mjs                                  # Install globally for all detected AI agents
 *   node install.mjs --target "C:\ruta\a\tu\proyecto" # Install into a specific project
 *   node install.mjs --dry-run                        # Preview installation
 */
import "./00-meta-skills/skill-sync/scripts/install-skills.mjs";
