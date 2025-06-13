/* eslint-disable react-hooks/rules-of-hooks */
import { action } from '@storybook/addon-actions';
import { useArgs, useRef } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import {
  AI_CHAT_CONTAINER_SIZES,
  AiCliChatContainerSizeState,
  MarkdownCodeVariations,
  StepSettingsAiChatContainer,
} from '../../components';
import { AIChatMessages } from '../../components/ai-chat-messages/ai-chat-messages';
import { Button } from '../../ui/button';
import { Toaster } from '../../ui/toaster';
import { TooltipProvider } from '../../ui/tooltip';
import { sampleAIChatMessages } from './sample-messages';

const meta = {
  title: 'Components/StepSettingsAiChatContainer',
  component: StepSettingsAiChatContainer,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    containerSize: {
      control: {
        type: 'select',
        options: [
          AI_CHAT_CONTAINER_SIZES.COLLAPSED,
          AI_CHAT_CONTAINER_SIZES.DOCKED,
          AI_CHAT_CONTAINER_SIZES.EXPANDED,
        ],
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="h-[800px]">
          <Story />
          <Toaster />
        </div>
      </TooltipProvider>
    ),
  ],
  render: (args) => {
    const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
    const lastAssistantMessageRef = useRef<HTMLDivElement | null>(null);
    const [
      { containerSize, showAiChat, setShowAiChat, toggleContainerSizeState },
      updateArgs,
    ] = useArgs();

    const onToggleContainerSizeState = (size: AiCliChatContainerSizeState) => {
      toggleContainerSizeState(size);
      updateArgs({ containerSize: size });
    };

    const onSetShowAiChat = (showAiChat: boolean) => {
      setShowAiChat(showAiChat);
      updateArgs({ showAiChat: showAiChat });
    };

    return (
      <>
        {!showAiChat && (
          <Button onClick={() => onSetShowAiChat(true)}>Show AI Chat</Button>
        )}
        <StepSettingsAiChatContainer
          {...args}
          containerSize={containerSize}
          toggleContainerSizeState={onToggleContainerSizeState}
          showAiChat={showAiChat}
          className="static"
          lastUserMessageRef={lastUserMessageRef}
          lastAssistantMessageRef={lastAssistantMessageRef}
          messages={sampleAIChatMessages}
        ></StepSettingsAiChatContainer>
      </>
    );
  },
} satisfies Meta<typeof StepSettingsAiChatContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docked: Story = {
  args: {
    parentHeight: 800,
    parentWidth: 800,
    containerSize: AI_CHAT_CONTAINER_SIZES.DOCKED,
    showAiChat: true,
    toggleContainerSizeState: fn(),
    handleSubmit: fn(),
    onCloseClick: fn(),
    enableNewChat: true,
    onNewChatClick: fn(),
    onToggle: fn(),
    input: '',
    handleInputChange: fn(),
    isEmpty: true,
    availableModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-2'],
    selectedModel: 'gpt-4',
    onModelSelected: fn(),
    isModelSelectorLoading: false,
  },
};

export const Expanded: Story = {
  args: {
    ...Docked.args,
    containerSize: AI_CHAT_CONTAINER_SIZES.EXPANDED,
  },
};

export const Collapsed: Story = {
  args: {
    ...Docked.args,
    containerSize: AI_CHAT_CONTAINER_SIZES.COLLAPSED,
  },
};

export const Populated: Story = {
  args: {
    ...Docked.args,
    isEmpty: false,
  },
  render: (args) => {
    const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
    const lastAssistantMessageRef = useRef<HTMLDivElement | null>(null);
    const [
      { containerSize, showAiChat, setShowAiChat, toggleContainerSizeState },
      updateArgs,
    ] = useArgs();

    const onToggleContainerSizeState = (size: AiCliChatContainerSizeState) => {
      toggleContainerSizeState(size);
      updateArgs({ containerSize: size });
    };

    const onSetShowAiChat = (showAiChat: boolean) => {
      setShowAiChat(showAiChat);
      updateArgs({ showAiChat: showAiChat });
    };

    return (
      <>
        {!showAiChat && (
          <Button onClick={() => onSetShowAiChat(true)}>Show AI Chat</Button>
        )}
        <StepSettingsAiChatContainer
          {...args}
          containerSize={containerSize}
          toggleContainerSizeState={onToggleContainerSizeState}
          showAiChat={showAiChat}
          className="static"
          lastUserMessageRef={lastUserMessageRef}
          lastAssistantMessageRef={lastAssistantMessageRef}
          messages={sampleAIChatMessages}
        >
          <AIChatMessages
            messages={sampleAIChatMessages}
            onInject={action('Inject command')}
            codeVariation={MarkdownCodeVariations.WithCopyAndInject}
          />
        </StepSettingsAiChatContainer>
      </>
    );
  },
};

export const NewChatDisabled: Story = {
  args: {
    ...Populated.args,
    enableNewChat: false,
  },
  render: Populated.render,
};
