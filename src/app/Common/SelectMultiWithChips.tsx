import React, { useEffect, useState } from 'react';
import {
  Button,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

const SelectMultiWithChips = (props: {
  id: string;
  placeholder: string;
  options: SelectOptionProps[];
  onSelect: (selection) => void;
  onClear: () => void;
  selection: string[];
  create?: boolean;
  closeOnSelect?: boolean;
  readonly?: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [selected, setSelected] = useState<string[]>(props.selection);
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>(props.options);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [onCreation, setOnCreation] = React.useState<boolean>(false);
  const textInputRef = React.useRef<HTMLInputElement>();

  useEffect(() => {
    setSelected(props.selection);
  }, [props.selection]);

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = props.options;

    // Filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = props.options.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(inputValue.toLowerCase())
      );

      // When no options are found after filtering, display creation option
      if (!newSelectOptions.length && props.create) {
        newSelectOptions = [{ isDisabled: false, children: `Create "${inputValue}"`, value: 'create' }];
      } else if (!newSelectOptions.length) {
        newSelectOptions = [{ isDisabled: false, children: 'no results', value: 'no results' }];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setFocusedItemIndex(null);
    setActiveItem(null);
  }, [inputValue, onCreation]);

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[indexToFocus];
      setActiveItem(`select-multi-typeahead-${focusedItem.value.replace(' ', '-')}`);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter((menuItem) => !menuItem.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        if (!isOpen) {
          setIsOpen((prevIsOpen) => !prevIsOpen);
        } else if (isOpen && focusedItem.value !== 'no results') {
          onSelect(focusedItem.value as string);
          setInputValue('');
        }
        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
  };

  const onSelect = (value: string) => {
    if (props.create) {
      if (value) {
        if (value === 'create') {
          if (!selectOptions.some((item) => item.value === inputValue)) {
            setSelectOptions([...props.options, { id: inputValue, value: inputValue, children: inputValue }]);
          }
          setSelected(
            selected.includes(inputValue)
              ? selected.filter((selection) => selection !== inputValue)
              : [...selected, inputValue]
          );
          setOnCreation(!onCreation);
          props.onSelect(inputValue);
        } else {
          setSelected(
            selected.includes(value) ? selected.filter((selection) => selection !== value) : [...selected, value]
          );
          props.onSelect(value);
        }
        setIsOpen(!props.closeOnSelect);
      }
    } else {
      if (value && value !== 'no results') {
        setSelected(
          selected.includes(value) ? selected.filter((selection) => selection !== value) : [...selected, value]
        );
        props.onSelect(value);
        setIsOpen(!props.closeOnSelect);
      }
    }
    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      data-cy={'menu-toogle-' + props.id}
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={'multi-typeahead-select-input-' + props.id}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={props.placeholder}
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={'select-multi-typeahead-' + props.id}
        >
          <LabelGroup numLabels={6} aria-label="Current selections">
            {selected.map((selection, index) => (
              <Label
                key={index}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelect(selection);
                }}
                isReadOnly={props.readonly && props.readonly.includes(selection)}
                disabled={props.readonly && props.readonly.includes(selection)}
              >
                {selection}
              </Label>
            ))}
          </LabelGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          {selected.length > 0 && (
            <Button
              variant="plain"
              onClick={() => {
                setInputValue('');
                setSelected([]);
                props.onClear();
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id={'select-multi-typeahead-' + props.id}
      data-cy={'select-multi-typeahead-' + props.id}
      isOpen={isOpen}
      selected={selected}
      onSelect={(ev, selection) => onSelect(selection as string)}
      onOpenChange={() => setIsOpen(false)}
      toggle={toggle}
      isScrollable
    >
      <SelectList
        isAriaMultiselectable
        id={'selectlist-multi-typeahead-' + props.id}
        data-cy={'selectlist-multi-typeahead-' + props.id}
      >
        {selectOptions.map((option, index) => (
          <SelectOption
            key={option.value || option.children}
            isFocused={focusedItemIndex === index}
            className={option.className}
            id={`option-typeahead-${option.id !== undefined ? option.id : option.value}`}
            data-cy={`option-typeahead-${option.id !== undefined ? option.id : option.value}`}
            {...option}
            ref={null}
            description={option.description}
          />
        ))}
      </SelectList>
    </Select>
  );
};

export { SelectMultiWithChips };
