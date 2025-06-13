import {
  copyPasteToast,
  toast,
  UNSAVED_CHANGES_TOAST,
} from '@openops/components/ui';
import {
  Action,
  ActionType,
  flowHelper,
  FlowOperationType,
  FlowVersion,
  isNil,
  openOpsId,
  StepLocationRelativeToParent,
} from '@openops/shared';
import { useCallback } from 'react';
import { useBuilderStateContext } from '../builder-hooks';
import { useApplyOperationAndPushToHistory } from '../flow-version-undo-redo/hooks/apply-operation-and-push-to-history';
import { useCenterWorkflowViewOntoStep } from './center-workflow-view-onto-step';

export const assignNewIdsToActions = (action: Action): Action => {
  const newAction = { ...action };
  newAction.id = openOpsId();

  if (newAction.nextAction) {
    newAction.nextAction = assignNewIdsToActions(newAction.nextAction);
  }

  if (newAction.type === ActionType.BRANCH) {
    if (newAction.onSuccessAction) {
      newAction.onSuccessAction = assignNewIdsToActions(
        newAction.onSuccessAction,
      );
    }
    if (newAction.onFailureAction) {
      newAction.onFailureAction = assignNewIdsToActions(
        newAction.onFailureAction,
      );
    }
  }

  if (
    newAction.type === ActionType.LOOP_ON_ITEMS &&
    newAction.firstLoopAction
  ) {
    newAction.firstLoopAction = assignNewIdsToActions(
      newAction.firstLoopAction,
    );
  }

  if (newAction.type === ActionType.SPLIT && newAction.branches) {
    newAction.branches = newAction.branches.map((branch) => ({
      ...branch,
      nextAction: branch.nextAction
        ? assignNewIdsToActions(branch.nextAction)
        : undefined,
    }));
  }

  return newAction;
};

export const usePaste = () => {
  const applyOperationAndPushToHistory = useApplyOperationAndPushToHistory();
  const flowVersion = useBuilderStateContext((state) => state.flowVersion);
  const centerWorkflowViewOntoStep = useCenterWorkflowViewOntoStep();

  const onPaste = useCallback(
    async (
      actionToPaste: Action,
      stepLocationRelativeToParent: StepLocationRelativeToParent,
      selectedStep: string | null,
      branchNodeId?: string,
    ) => {
      if (isNil(actionToPaste) && navigator.clipboard) {
        try {
          const text = await navigator.clipboard.readText();
          const parsedAction = JSON.parse(text);
          if (parsedAction?.name && parsedAction?.settings) {
            actionToPaste = parsedAction;
          }
        } catch (err: any) {
          if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            console.error('Clipboard permission denied');
          } else {
            console.error('Failed to copy:', err);
          }
          copyPasteToast({
            success: false,
            isCopy: false,
          });
          return;
        }
      }

      if (actionToPaste) {
        const actionWithNewIds = assignNewIdsToActions(actionToPaste);
        const itemsCount = flowHelper.getAllSteps(actionWithNewIds).length;
        applyOperationAndPushToHistory(
          {
            type: FlowOperationType.PASTE_ACTIONS,
            request: {
              action: actionWithNewIds,
              parentStep: getParentStepForPaste(flowVersion, selectedStep),
              stepLocationRelativeToParent,
              branchNodeId,
            },
          },
          () => toast(UNSAVED_CHANGES_TOAST),
        ).then(() => {
          centerWorkflowViewOntoStep(actionWithNewIds.name);
          copyPasteToast({
            success: true,
            isCopy: false,
            itemsCount,
          });
        });
      }
    },
    [applyOperationAndPushToHistory, centerWorkflowViewOntoStep, flowVersion],
  );

  return {
    onPaste,
  };
};

const getParentStepForPaste = (
  flowVersion: FlowVersion,
  selectedStep: string | null,
) => {
  if (selectedStep) {
    return selectedStep;
  }

  const allSteps = flowHelper.getAllSteps(flowVersion.trigger);
  const lastStep = allSteps[allSteps.length - 1];

  return lastStep.name;
};
