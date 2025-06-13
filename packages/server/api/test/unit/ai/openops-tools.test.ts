const mockBasePath = '/mock/base/path';
const mockApiBaseUrl = 'http://test-api-url';
const mockTools = {
  tool1: { description: 'Test tool 1', parameters: {} },
  tool2: { description: 'Test tool 2', parameters: {} },
};

const systemMock = {
  get: jest.fn(),
  getOrThrow: jest.fn(),
};

const loggerMock = {
  warn: jest.fn(),
  error: jest.fn(),
};

const networkUtlsMock = {
  getInternalApiUrl: jest.fn(),
};

const createMcpClientMock = jest.fn();

jest.mock('ai', () => ({
  experimental_createMCPClient: createMcpClientMock,
}));

jest.mock('@openops/server-shared', () => ({
  ...jest.requireActual('@openops/server-shared'),
  system: systemMock,
  logger: loggerMock,
  networkUtls: networkUtlsMock,
  AppSystemProp: {
    OPENOPS_MCP_SERVER_PATH: 'OPENOPS_MCP_SERVER_PATH',
  },
  SharedSystemProp: {
    LOGZIO_TOKEN: 'LOGZIO_TOKEN',
    ENVIRONMENT_NAME: 'ENVIRONMENT_NAME',
  },
}));

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  writeFile: jest.fn(),
}));

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  tmpdir: jest.fn().mockReturnValue('/tmp'),
}));

import '@fastify/swagger';
import { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { getOpenOpsTools } from '../../../src/app/ai/mcp/openops-tools';

describe('getOpenOpsTools', () => {
  const mockOpenApiSchema = {
    openapi: '3.1',
    paths: {
      '/v1/files/{fileId}': {
        get: { operationId: 'getFile' },
      },
      '/v1/flow-versions/': {
        get: { operationId: 'getFlowVersions' },
      },
      '/v1/flows/{id}': {
        get: { operationId: 'getFlow' },
      },
      '/v1/blocks/categories': {
        get: { operationId: 'getBlockCategories' },
      },
      '/v1/blocks/': {
        get: { operationId: 'getBlocks' },
      },
      '/v1/blocks/{scope}/{name}': {
        get: { operationId: 'getBlockScopeName' },
      },
      '/v1/blocks/{name}': {
        get: { operationId: 'getBlockName' },
      },
      '/v1/flow-runs/': {
        get: { operationId: 'getFlowRuns' },
      },
      '/v1/flow-runs/{id}': {
        get: { operationId: 'getFlowRun' },
      },
      '/v1/flow-runs/{id}/retry': {
        post: { operationId: 'retryFlowRun' },
      },
      '/v1/app-connections/': {
        get: { operationId: 'getAppConnections' },
        post: { operationId: 'createAppConnection' },
        patch: { operationId: 'patchAppConnection' },
      },
      '/v1/app-connections/{id}': {
        get: { operationId: 'getAppConnectionById' },
      },
      '/v1/app-connections/metadata': {
        get: { operationId: 'getAppConnectionsMetadata' },
      },
      '/v1/other/endpoint': {
        get: { operationId: 'getOther' },
      },
    },
  };

  const filteredSchema = {
    openapi: '3.1',
    paths: {
      '/v1/files/{fileId}': {
        get: { operationId: 'getFile' },
      },
      '/v1/flow-versions/': {
        get: { operationId: 'getFlowVersions' },
      },
      '/v1/flows/{id}': {
        get: { operationId: 'getFlow' },
      },
      '/v1/blocks/categories': {
        get: { operationId: 'getBlockCategories' },
      },
      '/v1/blocks/': {
        get: { operationId: 'getBlocks' },
      },
      '/v1/blocks/{scope}/{name}': {
        get: { operationId: 'getBlockScopeName' },
      },
      '/v1/blocks/{name}': {
        get: { operationId: 'getBlockName' },
      },
      '/v1/flow-runs/': {
        get: { operationId: 'getFlowRuns' },
      },
      '/v1/flow-runs/{id}': {
        get: { operationId: 'getFlowRun' },
      },
      '/v1/flow-runs/{id}/retry': {
        post: { operationId: 'retryFlowRun' },
      },
      '/v1/app-connections/': {
        get: { operationId: 'getAppConnections' },
        post: { operationId: 'createAppConnection' },
        patch: { operationId: 'patchAppConnection' },
      },
      '/v1/app-connections/{id}': {
        get: { operationId: 'getAppConnectionById' },
      },
      '/v1/app-connections/metadata': {
        get: { operationId: 'getAppConnectionsMetadata' },
      },
    },
  };

  const mockApp = {
    swagger: jest.fn().mockReturnValue(mockOpenApiSchema),
  } as unknown as FastifyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    systemMock.getOrThrow.mockImplementation((key) => {
      if (key === 'OPENOPS_MCP_SERVER_PATH') return mockBasePath;
      throw new Error(`${key} not set`);
    });

    systemMock.get.mockImplementation((key) => {
      if (key === 'LOGZIO_TOKEN') return 'test-logzio-token';
      if (key === 'ENVIRONMENT_NAME') return 'test-environment';
      return undefined;
    });

    networkUtlsMock.getInternalApiUrl.mockReturnValue(mockApiBaseUrl);
  });

  it('should write the filtered OpenAPI schema to a file once and reuse it later', async () => {
    const mockClient = {
      tools: jest.fn().mockResolvedValue(mockTools),
    };
    createMcpClientMock.mockResolvedValue(mockClient);

    await getOpenOpsTools(mockApp, 'auth-1');
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join('/tmp', 'openapi-schema.json'),
      JSON.stringify(filteredSchema),
      'utf-8',
    );

    await getOpenOpsTools(mockApp, 'auth-2');
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('should create MCP client and return tools when successful', async () => {
    const mockClient = {
      tools: jest.fn().mockResolvedValue(mockTools),
    };
    createMcpClientMock.mockResolvedValue(mockClient);

    const result = await getOpenOpsTools(mockApp, 'test-auth-token');

    expect(result).toEqual({
      client: mockClient,
      toolSet: mockTools,
    });

    expect(createMcpClientMock).toHaveBeenCalledWith({
      transport: expect.objectContaining({
        serverParams: {
          command: `${mockBasePath}/.venv/bin/python`,
          args: [`${mockBasePath}/main.py`],
          env: expect.objectContaining({
            OPENAPI_SCHEMA_PATH: expect.any(String),
            AUTH_TOKEN: 'test-auth-token',
            API_BASE_URL: mockApiBaseUrl,
            OPENOPS_MCP_SERVER_PATH: mockBasePath,
            LOGZIO_TOKEN: 'test-logzio-token',
            ENVIRONMENT: 'test-environment',
          }),
        },
      }),
    });
  });
});
