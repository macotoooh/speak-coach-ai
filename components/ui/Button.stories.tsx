import type { Meta, StoryObj } from "@storybook/react";
import { faMicrophone, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Button",
    variant: BUTTON_VARIANTS.primary,
    size: BUTTON_SIZES.md,
  },
  argTypes: {
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: BUTTON_VARIANTS.secondary,
    children: "Secondary",
  },
};

export const Accent: Story = {
  args: {
    variant: BUTTON_VARIANTS.accent,
    children: "Record",
    leadingIcon: <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4" />,
    size: BUTTON_SIZES.lg,
  },
};

export const Ghost: Story = {
  args: {
    variant: BUTTON_VARIANTS.ghost,
    children: "Ghost",
  },
};

export const WithIcon: Story = {
  args: {
    children: "Listen",
    leadingIcon: <FontAwesomeIcon icon={faVolumeHigh} className="h-4 w-4" />,
    size: BUTTON_SIZES.lg,
  },
};

export const CompactControl: Story = {
  args: {
    children: "Generate candidate",
    size: BUTTON_SIZES.sm,
    variant: BUTTON_VARIANTS.primary,
  },
};
