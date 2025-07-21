import { Static, Type } from '@sinclair/typebox';

export const CreateOrganizationRequestBody = Type.Object({
  name: Type.String(),
  ownerId: Type.String(),
  tablesWorkspaceId: Type.Number(),
});

export type CreateOrganizationRequestBody = Static<
  typeof CreateOrganizationRequestBody
>;

export const UpdateOrganizationRequestBody = Type.Object({
  name: Type.Optional(Type.String()),
  ownerId: Type.Optional(Type.String()),
  tablesWorkspaceId: Type.Optional(Type.Number()),
});

export type UpdateOrganizationRequestBody = Static<
  typeof UpdateOrganizationRequestBody
>;
