import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import DifficultySelect from "@/components/DifficultySelect";
import {
  DEFAULT_EXAMPLE_SENTENCE_LEVEL,
  type ExampleSentenceLevel,
} from "@/lib/example-sentence-level";

function DifficultySelectStory() {
  const [value, setValue] = useState<ExampleSentenceLevel>(
    DEFAULT_EXAMPLE_SENTENCE_LEVEL,
  );

  return <DifficultySelect value={value} onChange={setValue} />;
}

const meta = {
  title: "Practice/DifficultySelect",
  component: DifficultySelect,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof DifficultySelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: DEFAULT_EXAMPLE_SENTENCE_LEVEL,
    onChange: () => {},
    disabled: false,
  },
  render: () => <DifficultySelectStory />,
};

export const Disabled: Story = {
  args: {
    value: DEFAULT_EXAMPLE_SENTENCE_LEVEL,
    onChange: () => {},
    disabled: true,
  },
  render: () => <DifficultySelect value={DEFAULT_EXAMPLE_SENTENCE_LEVEL} onChange={() => {}} disabled />,
};
