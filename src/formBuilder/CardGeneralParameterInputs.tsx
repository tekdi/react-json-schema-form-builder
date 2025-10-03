import React, { ReactElement, useCallback } from 'react';
import Select from 'react-select';
import { Input, FormGroup, FormFeedback } from 'reactstrap';
import GeneralParameterInputs from './GeneralParameterInputs';
import {
  defaultUiProps,
  defaultDataProps,
  categoryToNameMap,
  categoryType,
  subtractArray,
  getRandomId,
} from './utils';
import type {
  Mods,
  ModLabels,
  FormInput,
  CardComponentPropsType,
} from './types';
import Tooltip from './Tooltip';
import QuillEditor from './QuillEditor';
import FBCheckbox from './checkbox/FBCheckbox';

// specify the inputs required for any type of object
export default function CardGeneralParameterInputs({
  parameters,
  onChange,
  allFormInputs,
  mods,
  showObjectNameInput = true,
}: {
  parameters: CardComponentPropsType;
  onChange: (newParams: CardComponentPropsType) => void;
  mods?: Mods;
  allFormInputs: { [key: string]: FormInput };
  showObjectNameInput?: boolean;
}): ReactElement {
  const [keyState, setKeyState] = React.useState(parameters.name);
  const [keyError, setKeyError] = React.useState<null | string>(null);
  const [titleState, setTitleState] = React.useState(parameters.title);
  const [descriptionState, setDescriptionState] = React.useState(
    parameters.description,
  );
  const [isTooltipState, setIsTooltipState] = React.useState(
    parameters.isTooltip || false,
  );
  const [elementId] = React.useState(getRandomId());
  const categoryMap = categoryToNameMap(allFormInputs);

  // Function to convert display name to camelCase for object name
  const toCamelCase = (str: string): string => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters
  };

  const fetchLabel = (
    labelName: string,
    defaultLabel: string,
  ): string | undefined => {
    return mods &&
      mods.labels &&
      typeof mods.labels[labelName as keyof ModLabels] === 'string'
      ? mods.labels[labelName as keyof ModLabels]
      : defaultLabel;
  };

  const objectNameLabel = fetchLabel('objectNameLabel', 'Object Name');
  const displayNameLabel = fetchLabel('displayNameLabel', 'Display Name');
  const descriptionLabel = fetchLabel('descriptionLabel', 'Description');
  const inputTypeLabel = fetchLabel('inputTypeLabel', 'Input Type');

  const availableInputTypes = () => {
    const definitionsInSchema =
      parameters.definitionData &&
      Object.keys(parameters.definitionData).length !== 0;

    // Hide the "Reference" option if there are no definitions in the schema
    let inputKeys = Object.keys(categoryMap).filter(
      (key) => key !== 'ref' || definitionsInSchema,
    );
    // Exclude hidden inputs based on mods
    if (mods) inputKeys = subtractArray(inputKeys, mods.deactivatedFormInputs);

    return inputKeys
      .map((key) => ({ value: key, label: categoryMap[key] }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const handleChange = useCallback(
    (ev: any) => {
      const newTitle = ev.target.value;
      setTitleState(newTitle);

      // Auto-generate camelCase name
      const newObjectName = toCamelCase(newTitle);

      // Conflict check
      let uniqueName = newObjectName;
      if (
        parameters.neighborNames &&
        parameters.neighborNames.includes(newObjectName) &&
        newObjectName !== parameters.name
      ) {
        let counter = 1;
        while (
          parameters.neighborNames.includes(`${newObjectName}${counter}`)
        ) {
          counter++;
        }
        uniqueName = `${newObjectName}${counter}`;
      }

      setKeyState(uniqueName);
      setKeyError(null);
    },
    [parameters.neighborNames, parameters.name],
  );

  const handleBlur = useCallback(() => {
    onChange({
      ...parameters,
      title: titleState,
      name: keyState,
    });
  }, [parameters, titleState, keyState, onChange]);

  return (
    <React.Fragment>
      <div className='card-entry-row'>
        {showObjectNameInput && (
          <div className='card-entry'>
            <h5>
              {`${objectNameLabel} `}
              <Tooltip
                text={
                  mods &&
                  mods.tooltipDescriptions &&
                  typeof mods.tooltipDescriptions.cardObjectName === 'string'
                    ? mods.tooltipDescriptions.cardObjectName
                    : 'The back-end name of the object'
                }
                id={`${elementId}_nameinfo`}
                type='help'
              />
            </h5>

            <FormGroup>
              <Input
                disabled={true}
                value={keyState || ''}
                placeholder='Display Name'
                type='text'
                className='card-text'
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
              {keyError && <FormFeedback>{keyError}</FormFeedback>}
            </FormGroup>
          </div>
        )}
        <div
          className={`card-entry ${
            parameters.$ref === undefined ? '' : 'disabled-input'
          }`}
        >
          <h5>
            {`${displayNameLabel} `}
            <Tooltip
              text={
                mods &&
                mods.tooltipDescriptions &&
                typeof mods.tooltipDescriptions.cardDisplayName === 'string'
                  ? mods.tooltipDescriptions.cardDisplayName
                  : 'The user-facing name of this object'
              }
              id={`${elementId}-titleinfo`}
              type='help'
            />
          </h5>
          <Input
            value={titleState || ''}
            placeholder='Title'
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            className='card-text'
          />
        </div>
      </div>
      <div className='card-entry-row'>
        <div className='card-entry wide-card-entry'>
          <h5>
            {`${inputTypeLabel} `}
            <Tooltip
              text={
                mods &&
                mods.tooltipDescriptions &&
                typeof mods.tooltipDescriptions.cardInputType === 'string'
                  ? mods.tooltipDescriptions.cardInputType
                  : 'The type of form input displayed on the form'
              }
              id={`${elementId}-inputinfo`}
              type='help'
            />
          </h5>
          <Select
            value={{
              value: parameters.category,
              label: categoryMap[parameters.category!],
            }}
            placeholder={inputTypeLabel}
            options={availableInputTypes()}
            openMenuOnClick={true}
            openMenuOnFocus={true}
            onChange={(val: any) => {
              // figure out the new 'type'
              const newCategory = val.value;

              const newProps = {
                ...defaultUiProps(newCategory, allFormInputs),
                ...defaultDataProps(newCategory, allFormInputs),
                name: parameters.name,
                required: parameters.required,
              };
              if (newProps.$ref !== undefined && !newProps.$ref) {
                // assign an initial reference
                const firstDefinition = Object.keys(
                  parameters.definitionData!,
                )[0];
                newProps.$ref = `#/definitions/${firstDefinition || 'empty'}`;
              }
              onChange({
                ...newProps,
                title: newProps.title || parameters.title,
                default: newProps.default || '',
                type: newProps.type || categoryType(newCategory, allFormInputs),
                category: newProps.category || newCategory,
              });
            }}
            className='card-select'
          />
        </div>
      </div>

      <div className='card-entry-row'>
        <div
          className={`card-entry wide-card-entry ${parameters.$ref ? 'disabled-input' : ''}`}
        >
          <h5>
            {`${descriptionLabel} `}
            <Tooltip
              text={
                mods &&
                mods.tooltipDescriptions &&
                typeof mods.tooltipDescriptions.cardDescription === 'string'
                  ? mods.tooltipDescriptions.cardDescription
                  : 'This will appear as help text on the form'
              }
              id={`${elementId}-descriptioninfo`}
              type='help'
            />
          </h5>
          <FormGroup>
            <QuillEditor
              value={descriptionState || ''}
              placeholder='Description'
              onChange={(value) => {
                setDescriptionState(value);
                onChange({ ...parameters, description: value });
              }}
              className='card-text'
            />
          </FormGroup>
          <FormGroup>
            <FBCheckbox
              onChangeValue={() => {
                const newIsTooltip = !isTooltipState;
                setIsTooltipState(newIsTooltip);
                onChange({ ...parameters, isTooltip: newIsTooltip });
              }}
              isChecked={isTooltipState}
              label='Show description in tooltip'
              id={`${elementId}_istooltip`}
            />
          </FormGroup>
        </div>
      </div>

      <div className='card-category-options'>
        <GeneralParameterInputs
          category={parameters.category!}
          parameters={parameters}
          onChange={onChange}
          mods={mods}
          allFormInputs={allFormInputs}
        />
      </div>
    </React.Fragment>
  );
}
