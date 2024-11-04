import React, { ReactNode } from 'react';
import { Button, Flex, FlexItem, Popover, Content } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

/**
 * This component is used to add pop over helps to forms
 */
const PopoverHelp = (props: { name: string; label: string; content: string | ReactNode; text?: string }) => {
  const popOver = (
    <Popover headerContent={props.label} bodyContent={props.content}>
      <Button
        variant="plain"
        aria-label={'more-info-' + props.name}
        onClick={(e) => e.preventDefault()}
        aria-describedby={'help' + props.name}
        className="pf-v5-c-form__group-label-help"
        icon={<HelpIcon />}
      />
    </Popover>
  );

  if (props.text) {
    return (
      <Content>
        {props.text} {popOver}
      </Content>
    );
  }

  return popOver;
};
export { PopoverHelp };
