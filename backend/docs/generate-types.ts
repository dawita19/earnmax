#!/usr/bin/env ts-node
import { OpenAPIV3 } from 'openapi-types';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import prettier from 'prettier';

const API_SPEC_PATH = path.join(__dirname, '../docs/api-spec.yaml');
const OUTPUT_PATH = path.join(__dirname, '../../frontend/src/types/generated-api.ts');

async function generateTypes() {
  try {
    // Load OpenAPI spec (could also fetch from URL)
    const spec = fs.readFileSync(API_SPEC_PATH, 'utf-8');
    const parsed = require('yaml').parse(spec) as OpenAPIV3.Document;

    // Type generation logic
    let typeDefinitions = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from ${API_SPEC_PATH} at ${new Date().toISOString()}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export namespace ApiTypes {
`;

    // Generate schema types
    if (parsed.components?.schemas) {
      for (const [name, schema] of Object.entries(parsed.components.schemas)) {
        if ('type' in schema) {
          typeDefinitions += `  export interface ${name} {\n`;
          
          if (schema.type === 'object' && schema.properties) {
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
              if ('$ref' in propSchema) {
                const refType = propSchema.$ref.split('/').pop();
                typeDefinitions += `    ${propName}: ${refType};\n`;
              } else if ('type' in propSchema) {
                typeDefinitions += `    ${propName}: ${mapOpenApiTypeToTs(propSchema)};\n`;
              }
            }
          }
          
          typeDefinitions += `  }\n\n`;
        }
      }
    }

    // Generate endpoint types
    typeDefinitions += `  export namespace Endpoints {\n`;
    
    for (const [path, methods] of Object.entries(parsed.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if ('operationId' in operation) {
          const opId = operation.operationId;
          const responseType = getResponseType(operation);
          
          typeDefinitions += `    export interface ${opId} {\n`;
          typeDefinitions += `      path: '${path}';\n`;
          typeDefinitions += `      method: '${method.toUpperCase()}';\n`;
          
          if (operation.requestBody) {
            typeDefinitions += `      requestBody: ${getRequestBodyType(operation.requestBody)};\n`;
          }
          
          typeDefinitions += `      response: ${responseType};\n`;
          typeDefinitions += `    }\n\n`;
        }
      }
    }
    
    typeDefinitions += `  }\n}\n`;

    // Format with Prettier
    const formatted = await prettier.format(typeDefinitions, {
      parser: 'typescript',
      singleQuote: true
    });

    // Write output
    fs.writeFileSync(OUTPUT_PATH, formatted);
    console.log(`Successfully generated types at ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('Type generation failed:', error);
    process.exit(1);
  }
}

// Helper functions
function mapOpenApiTypeToTs(schema: OpenAPIV3.SchemaObject): string {
  if (schema.enum) return schema.enum.map(e => `'${e}'`).join(' | ');
  switch (schema.type) {
    case 'integer': return 'number';
    case 'number': return schema.format === 'double' ? 'number' : 'number';
    case 'boolean': return 'boolean';
    case 'array': return `${mapOpenApiTypeToTs(schema.items)}[]`;
    default: return 'string';
  }
}

function getResponseType(operation: OpenAPIV3.OperationObject): string {
  const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
  if (successResponse && 'content' in successResponse) {
    const jsonContent = successResponse.content['application/json'];
    if (jsonContent?.schema) {
      if ('$ref' in jsonContent.schema) {
        return jsonContent.schema.$ref.split('/').pop();
      }
      return 'any'; // Simplified for example
    }
  }
  return 'void';
}

function getRequestBodyType(requestBody: OpenAPIV3.RequestBodyObject): string {
  const jsonContent = requestBody.content['application/json'];
  if (jsonContent?.schema) {
    if ('$ref' in jsonContent.schema) {
      return jsonContent.schema.$ref.split('/').pop();
    }
    return 'any'; // Simplified for example
  }
  return 'never';
}

generateTypes();