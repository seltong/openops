import { Static, Type } from '@sinclair/typebox';

export const CreateProjectRequestBody = Type.Object({
  ownerId: Type.String(),
  displayName: Type.String(),
  organizationId: Type.String(),
  externalId: Type.Optional(Type.String()),
  tablesDatabaseId: Type.Number(),
});

export type CreateProjectRequestBody = Static<typeof CreateProjectRequestBody>;
