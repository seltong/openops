import { FastifyPluginCallbackTypebox } from '@fastify/type-provider-typebox';
import { ApplicationError, ErrorCode } from '@openops/shared';
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

  fastify.get('/', async () => {
    const projects = await projectService.list();
    return paginationHelper.createPage(projects || [], null);
  });
  done();
};
