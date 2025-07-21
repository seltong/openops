import { FastifyPluginCallbackTypebox } from '@fastify/type-provider-typebox';
import {
  ApplicationError,
  CreateProjectRequestBody,
  ErrorCode,
  Project,
} from '@openops/shared';
import { StatusCodes } from 'http-status-codes';
import { paginationHelper } from '../helper/pagination/pagination-utils';
import { projectService } from './project-service';

export const userProjectController: FastifyPluginCallbackTypebox = (
  fastify,
  _opts,
  done,
) => {
  fastify.get('/:id', async (request, response) => {
    try {
      return await projectService.getOneOrThrow(request.principal.projectId);
    } catch (err) {
      if (err instanceof ApplicationError) {
        err.error.code = ErrorCode.ENTITY_NOT_FOUND;
        return response.code(401).send();
      }
      throw err;
    }
  });

  fastify.post('/', CreateProjectRequest, async (req) => {
    return projectService.create({ ...req.body });
  });

  fastify.get('/', async (request) => {
    const projects = await projectService.list();
    return paginationHelper.createPage(projects || [], null);
  });
  done();
};

const CreateProjectRequest = {
  schema: {
    body: CreateProjectRequestBody,
    response: {
      [StatusCodes.OK]: Project,
    },
  },
};
