import { INestApplication } from '@nestjs/common';
import { SpelunkerModule } from 'nestjs-spelunker';

import { LoggerService } from '@/logger/logger.service';

export const setupSpelunker = (app: INestApplication): void => {
  const logger = app.get(LoggerService);

  try {
    // Generate and log Mermaid graph visualization
    // Exclude technical/infrastructure modules
    const tree = SpelunkerModule.explore(app, {
      ignoreImports: [
        // NestJS core infrastructure modules
        /^BullModule$/i,
        /^ConfigModule$/i,
        /^LoggerModule$/i,
        /^RedisModule$/i,
        /^CacheModule$/i,
        /^S3Module$/i,
        /^DrizzleModule$/i,
        /^CookiesModule$/i,
        // Generic infrastructure patterns
        (moduleName: string) =>
          moduleName.includes('Module') &&
          (moduleName.includes('Config') ||
            moduleName.includes('Logger') ||
            moduleName.includes('Redis') ||
            moduleName.includes('Cache') ||
            moduleName.includes('Database') ||
            moduleName.includes('Drizzle')),
      ],
    });

    // Identify feature modules
    const featureModules = new Set<string>([
      'UsersModule',
      'AuthModule',
      'MailsModule',
      'SourcesModule',
      'UserActivityModule',
      'RawPostsModule',
      'ArticlesModule',
      'ComplaintsModule',
      'MediaModule',
      'AdminModule',
      'UserSourcesModule',
    ]);

    // Generic module names that need prefixing
    const genericModules = new Set<string>([
      'ServiceModule',
      'OperationModule',
      'UiModule',
    ]);

    // Build ownership mapping using composite keys to handle multiple instances
    // Key format: "moduleName:parentContext" -> owner feature module
    const moduleOwnership = new Map<string, string>();

    // First pass: establish direct ownership from feature modules
    tree.forEach((module) => {
      const moduleName = module.name;
      const isFeatureModule = featureModules.has(moduleName);

      if (module.imports && Array.isArray(module.imports)) {
        module.imports.forEach((importedModule) => {
          if (isFeatureModule && genericModules.has(importedModule)) {
            // Feature module directly imports generic module
            const key = `${importedModule}:${moduleName}`;
            moduleOwnership.set(key, moduleName);
          }
        });
      }
    });

    // Second pass: establish transitive ownership
    // If OperationModule (owned by Users) imports ServiceModule,
    // then ServiceModule is also owned by Users
    tree.forEach((module) => {
      const moduleName = module.name;

      if (module.imports && Array.isArray(module.imports)) {
        // Find who owns this module
        let owner: string | null = null;
        if (featureModules.has(moduleName)) {
          owner = moduleName;
        } else {
          // Try to find owner from our mapping
          for (const [key, value] of moduleOwnership.entries()) {
            if (key.startsWith(`${moduleName}:`)) {
              owner = value;
              break;
            }
          }
        }

        if (owner) {
          module.imports.forEach((importedModule) => {
            if (genericModules.has(importedModule)) {
              const key = `${importedModule}:${owner}`;
              if (!moduleOwnership.has(key)) {
                moduleOwnership.set(key, owner);
              }
            }
          });
        }
      }
    });

    // Build a helper to get the prefixed name for a module
    const getPrefixedName = (
      moduleName: string,
      contextModule?: string,
    ): string => {
      // Feature modules don't need prefixing
      if (featureModules.has(moduleName)) {
        return moduleName;
      }

      // For generic modules, try to determine ownership
      if (genericModules.has(moduleName)) {
        // Strategy 1: If context is a feature module, use it directly
        if (contextModule && featureModules.has(contextModule)) {
          const prefix = contextModule.replace('Module', '');
          return `${prefix}${moduleName}`;
        }

        // Strategy 2: Look up ownership using context
        if (contextModule) {
          // Try direct key first
          const directKey = `${moduleName}:${contextModule}`;
          const owner = moduleOwnership.get(directKey);
          if (owner) {
            const prefix = owner.replace('Module', '');
            return `${prefix}${moduleName}`;
          }

          // If context is a generic module, find its owner
          if (genericModules.has(contextModule)) {
            for (const [key, value] of moduleOwnership.entries()) {
              if (key.startsWith(`${contextModule}:`)) {
                const prefix = value.replace('Module', '');
                return `${prefix}${moduleName}`;
              }
            }
          }
        }

        // Strategy 3: Find any ownership for this module
        for (const [key, value] of moduleOwnership.entries()) {
          if (key.startsWith(`${moduleName}:`)) {
            const prefix = value.replace('Module', '');
            return `${prefix}${moduleName}`;
          }
        }
      }

      // Return as-is if we can't determine ownership
      return moduleName;
    };

    // Build graph with prefixed names
    const edges: Array<{ from: string; to: string }> = [];
    const processedEdges = new Set<string>();

    // Process each module and its imports
    tree.forEach((module) => {
      const fromModule = module.name;
      const fromModulePrefixed = getPrefixedName(fromModule);

      if (module.imports && Array.isArray(module.imports)) {
        module.imports.forEach((importedModule) => {
          const toModulePrefixed = getPrefixedName(importedModule, fromModule);
          const edgeKey = `${fromModulePrefixed}-->${toModulePrefixed}`;

          // Only add edge if not already processed
          if (!processedEdges.has(edgeKey)) {
            edges.push({ from: fromModulePrefixed, to: toModulePrefixed });
            processedEdges.add(edgeKey);
          }
        });
      }
    });

    const mermaidEdges = edges.map(({ from, to }) => `  ${from}-->${to}`);
    const mermaidGraph = `graph LR\n${mermaidEdges.join('\n')}`;

    logger.log(
      `=== Module Dependency Graph (Mermaid) ===\n${mermaidGraph} \n=== Module Dependency Graph (Mermaid) ===`,
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.warn(
      `Failed to generate module dependency graph: ${errorMessage}`,
      'Spelunker',
    );
  }
};
