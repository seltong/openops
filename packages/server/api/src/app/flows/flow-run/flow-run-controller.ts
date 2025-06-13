import {
  FastifyPluginCallbackTypebox,
  Type,
} from '@fastify/type-provider-typebox';
import {
  ALL_PRINCIPAL_TYPES,
  ApplicationError,
  assertNotNullOrUndefined,
  ErrorCode,
  ExecutionType,
  FlowRun,
  isNil,
  ListFlowRunsRequestQuery,
  OpenOpsId,
  Permission,
  PrincipalType,
  ProgressUpdateType,
  RetryFlowRequestBody,
  SeekPage,
  SERVICE_KEY_SECURITY_OPENAPI,
} from '@openops/shared';
import { StatusCodes } from 'http-status-codes';
import { flowRunService } from './flow-run-service';

const DEFAULT_PAGING_LIMIT = 10;

export const flowRunController: FastifyPluginCallbackTypebox = (
  app,
  _options,
  done,
): void => {
  app.get('/', ListRequest, async (request) => {
    const projectId = request.principal.projectId;
    assertNotNullOrUndefined(projectId, 'projectId');
    return flowRunService.list({
      projectId,
      flowId: request.query.flowId,
      tags: request.query.tags,
      status: request.query.status,
      cursor: request.query.cursor ?? null,
      limit: Number(request.query.limit ?? DEFAULT_PAGING_LIMIT),
      createdAfter: request.query.createdAfter,
      createdBefore: request.query.createdBefore,
    });
  });

  app.get('/:id', GetRequest, async (request, reply) => {
    const flowRun = await flowRunService.getOnePopulatedOrThrow({
      projectId: request.principal.projectId,
      id: request.params.id,
    });
    await reply.send(flowRun);
  });

  app.all(
    '/:id/requests/:executionCorrelationId',
    ResumeFlowRunRequest,
    async (req) => {
      const headers = req.headers as Record<string, string>;
      const queryParams = req.query as Record<string, string>;
      await flowRunService.addToQueue({
        executionCorrelationId: req.params.executionCorrelationId,
        flowRunId: req.params.id,
        payload: {
          body: req.body,
          headers,
          queryParams,
        },
        progressUpdateType: ProgressUpdateType.TEST_FLOW,
        executionType: ExecutionType.RESUME,
      });
    },
  );

  app.post('/:id/retry', RetryFlowRequest, async (req) => {
    const flowRun = await flowRunService.retry({
      flowRunId: req.params.id,
      strategy: req.body.strategy,
    });

    if (isNil(flowRun)) {
      throw new ApplicationError({
        code: ErrorCode.FLOW_RUN_NOT_FOUND,
        params: {
          id: req.params.id,
        },
      });
    }
    return flowRun;
  });

  done();
};

const FlowRunFiltered = Type.Omit(FlowRun, [
  'terminationReason',
  'pauseMetadata',
]);
const FlowRunFilteredWithNoSteps = Type.Omit(FlowRun, [
  'terminationReason',
  'pauseMetadata',
  'steps',
]);

const ListRequest = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
  },
  schema: {
    tags: ['workflow-runs'],
    description:
      'List workflow runs with advanced filtering and pagination capabilities. This endpoint retrieves a paginated list of workflow executions, supporting filtering by workflow ID, tags, status, and date range. Results include execution metadata, duration, status, and associated tags. Useful for monitoring and analyzing workflow execution history.',
    security: [SERVICE_KEY_SECURITY_OPENAPI],
    querystring: ListFlowRunsRequestQuery,
    response: {
      [StatusCodes.OK]: SeekPage(FlowRunFilteredWithNoSteps),
    },
  },
};

const GetRequest = {
  config: {
    allowedPrincipals: [PrincipalType.SERVICE, PrincipalType.USER],
  },
  schema: {
    tags: ['workflow-runs'],
    description:
      'Get detailed information about a specific flow run. This endpoint returns the complete execution data including status, duration, steps, error messages, and any associated metadata. Includes step-by-step execution details and their outputs. Essential for debugging and monitoring individual workflow executions.',
    security: [SERVICE_KEY_SECURITY_OPENAPI],
    params: Type.Object({
      id: OpenOpsId,
    }),
    response: {
      [StatusCodes.OK]: FlowRunFiltered,
    },
  },
};

const ResumeFlowRunRequest = {
  config: {
    allowedPrincipals: ALL_PRINCIPAL_TYPES,
  },
  schema: {
    description:
      'Handle requests for a specific flow run execution. This endpoint manages the lifecycle of flow run requests, including creating, updating, and retrieving request data. It supports various HTTP methods (GET, PUT, POST, PATCH, DELETE) for different request operations.',
    params: Type.Object({
      id: OpenOpsId,
      executionCorrelationId: Type.String(),
    }),
  },
};

const RetryFlowRequest = {
  config: {
    permission: Permission.RETRY_RUN,
  },
  schema: {
    description:
      'Retry a failed workflow run from either the failed step or the beginning. This endpoint allows users to re-execute a workflow run that has encountered errors, with options to specify the retry strategy (e.g., from the last failed step or from the start). Useful for recovering from transient errors or fixing issues in workflow logic.',
    params: Type.Object({
      id: OpenOpsId,
    }),
    body: RetryFlowRequestBody,
  },
};
