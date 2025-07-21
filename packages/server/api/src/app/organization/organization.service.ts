import {
  ApplicationError,
  ErrorCode,
  isNil,
  openOpsId,
  Organization,
  OrganizationId,
  spreadIfDefined,
  UpdateOrganizationRequestBody,
  UserId,
} from '@openops/shared';
import { repoFactory } from '../core/db/repo-factory';
import { userService } from '../user/user-service';
import { OrganizationEntity } from './organization.entity';

const repo = repoFactory<Organization>(OrganizationEntity);

export const organizationService = {
  async hasAnyOrganizations(): Promise<boolean> {
    const count = await repo().count();
    return count > 0;
  },
  async create(params: AddParams): Promise<Organization> {
    const { ownerId, name, tablesWorkspaceId } = params;

    const newOrganization: NewOrganization = {
      id: openOpsId(),
      ownerId,
      name,
      tablesWorkspaceId,
    };

    const savedOrganization = await repo().save(newOrganization);

    await userService.addOwnerToOrganization({
      id: ownerId,
      organizationId: savedOrganization.id,
    });

    return savedOrganization;
  },

  async getOldestOrganization(): Promise<Organization | null> {
    return repo().findOne({
      where: {},
      order: {
        created: 'ASC',
      },
    });
  },
  async update(params: UpdateParams): Promise<Organization> {
    const organization = await this.getOneOrThrow(params.id);
    const updatedOrganization: Organization = {
      ...organization,
      ...spreadIfDefined('name', params.name),
      ...spreadIfDefined('ownerId', params.ownerId),
      ...spreadIfDefined('tablesWorkspaceId', params.tablesWorkspaceId),
    };

    return repo().save(updatedOrganization);
  },

  async getOneOrThrow(id: OrganizationId): Promise<Organization> {
    const organization = await repo().findOneBy({
      id,
    });

    if (isNil(organization)) {
      throw new ApplicationError({
        code: ErrorCode.ENTITY_NOT_FOUND,
        params: {
          entityId: id,
          entityType: 'Organization',
          message: 'Organization not found',
        },
      });
    }

    return {
      ...organization,
    };
  },

  async getOne(id: OrganizationId): Promise<Organization | null> {
    return repo().findOneBy({
      id,
    });
  },

  async list(): Promise<Organization[] | null> {
    return repo().find();
  },
};

type AddParams = {
  ownerId: UserId;
  name: string;
  tablesWorkspaceId: number;
};

type NewOrganization = Omit<Organization, 'created' | 'updated'>;

type UpdateParams = UpdateOrganizationRequestBody & {
  id: OrganizationId;
};
