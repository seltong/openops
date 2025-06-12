import { projectHooks } from '@/app/common/hooks/project-hooks';
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@openops/components/ui';
import { t } from 'i18next';

const ProjectSelect = () => {
  const { data, isLoading } = projectHooks.useProjects();

  if (isLoading) {
    return <> </>;
  }

  return (
    <Select>
      <SelectTrigger className="w-96">
        <SelectValue placeholder={t('Select a project')} />
      </SelectTrigger>
      <SelectContent>
        <SelectLabel>Valcann</SelectLabel>
        <SelectLabel>Google</SelectLabel>

        {data?.map((project) => (
          <SelectLabel key={project.id}>{project.displayName}</SelectLabel>
        ))}
      </SelectContent>
    </Select>
  );
};

ProjectSelect.displayName = 'ProjectSelect';
export { ProjectSelect };
