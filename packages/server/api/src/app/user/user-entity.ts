import { Organization, Project, User } from '@openops/shared';
import { EntitySchema } from 'typeorm';
import { BaseColumnSchemaPart } from '../database/database-common';

export type UserSchema = User & {
  organizations: Organization[];
  projects: Project[];
};

export const UserEntity = new EntitySchema<UserSchema>({
  name: 'user',
  columns: {
    ...BaseColumnSchemaPart,
    email: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
    },
    verified: {
      type: Boolean,
    },
    status: {
      type: String,
    },
    trackEvents: {
      type: Boolean,
      nullable: true,
    },
    newsLetter: {
      type: Boolean,
      nullable: true,
    },
    organizationRole: {
      type: String,
      nullable: false,
    },
    externalId: {
      type: String,
      nullable: true,
    },
    organizationId: {
      type: String,
      nullable: true,
    },
  },
  indices: [
    {
      name: 'idx_user_organization_id_email',
      columns: ['email'],
      unique: true,
    },
  ],
  relations: {
    organizations: {
      target: 'organization',
      type: 'many-to-many',
      joinTable: {
        name: 'users_organizations',
        joinColumn: {
          name: 'user_id',
        },
        inverseJoinColumn: {
          name: 'organization_id',
        },
      },
      inverseSide: 'user',
      cascade: true,
    },
    projects: {
      type: 'one-to-many',
      target: 'user',
      inverseSide: 'owner',
    },
  },
});
