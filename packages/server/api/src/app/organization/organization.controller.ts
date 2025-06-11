import {
  FastifyPluginAsyncTypebox,
  Type,
} from '@fastify/type-provider-typebox';
import {
  assertEqual,
  CreateOrganizationRequestBody,
  EndpointScope,
  OpenOpsId,
  Organization,
  PrincipalType,
  SERVICE_KEY_SECURITY_OPENAPI,
  UpdateOrganizationRequestBody,
} from '@openops/shared';
import { StatusCodes } from 'http-status-codes';
import { organizationService } from './organization.service';

export const organizationController: FastifyPluginAsyncTypebox = async (
  app,
) => {
  app.post('/create', CreateOrganizationRequest, async (req) => {
    return organizationService.create({
      ...req.body,
    });
  });

  app.post('/:id', UpdateOrganizationRequest, async (req) => {
    return organizationService.update({
      id: req.params.id,
      ...req.body,
    });
  });

  app.get('/:id', GetOrganizationRequest, async (req) => {
    assertEqual(
      req.principal.organization.id,
      req.params.id,
      'userOrganizationId',
      'paramId',
    );

    const organization = await organizationService.getOneOrThrow(req.params.id);
    return organization;
  });

  app.get('/', async () => {
    const organizations = await organizationService.list();
    return organizations;
  });
};

const CreateOrganizationRequest = {
  schema: {
    body: CreateOrganizationRequestBody,
    response: {
      [StatusCodes.OK]: Organization,
    },
  },
};

const UpdateOrganizationRequest = {
  schema: {
    body: UpdateOrganizationRequestBody,
    params: Type.Object({
      id: OpenOpsId,
    }),
    response: {
      [StatusCodes.OK]: Organization,
    },
  },
};

const GetOrganizationRequest = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    scope: EndpointScope.ORGANIZATION,
  },
  schema: {
    tags: ['organizations'],
    security: [SERVICE_KEY_SECURITY_OPENAPI],
    description: 'Get a organization by id',
    params: Type.Object({
      id: OpenOpsId,
    }),
    response: {
      [StatusCodes.OK]: Organization,
    },
  },
};
