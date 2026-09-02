"use client";

import type { Workflow } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { StarIcon, WorkflowIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { Progress } from "@/components/ui/progress";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
  useWorkflowUsage,
} from "../hooks/use-workflows";
import { useWorkflowsParams } from "../hooks/use-workflows-params";

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsUsage = () => {
  const { data: usage, isLoading } = useWorkflowUsage();

  if (isLoading || !usage) return null;

  if (usage.isPremium) {
    return (
      <div className="flex items-center gap-2 self-start rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs">
        <StarIcon className="size-3.5 text-amber-500" />
        <span className="font-medium">Pro</span>
        <span className="text-muted-foreground">Unlimited workflows</span>
      </div>
    );
  }

  const left = Math.max(0, usage.freeLimit - usage.workflowCount);
  const atLimit = left === 0;

  return (
    <div className="w-full max-w-sm rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs">
      <div className="flex items-center justify-between gap-x-2">
        <span className="text-muted-foreground">Free plan</span>
        <span className="font-medium">
          {usage.workflowCount} of {usage.freeLimit} used · {left} left
        </span>
      </div>
      <Progress
        value={Math.round((usage.workflowCount / usage.freeLimit) * 100)}
        className="mt-1.5 h-1.5"
      />
      {atLimit && (
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
          Limit reached — upgrade to Pro for unlimited workflows.
        </p>
      )}
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data?.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <div className="flex flex-col gap-y-3">
        <EntityHeader
          title="Workflows"
          description="Create and manage your workflows"
          onNew={handleCreate}
          newButtonLabel="New workflow"
          disabled={disabled}
          isCreating={createWorkflow.isPending}
        />
        <WorkflowsUsage />
      </div>
    </>
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading Workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Error Loading Workflows..." />;
};
export const WorkflowsEmpty = () => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data?.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="You haven't created any workflows yet. Get started by creating your first workflow."
      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const removeWorkflow = useRemoveWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id });
  };

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })} •
          Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
};
