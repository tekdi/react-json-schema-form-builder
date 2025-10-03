import React, { ReactElement, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Select from 'react-select';
import { createUseStyles } from 'react-jss';
import {
  Alert,
  Input,
  UncontrolledTooltip,
  FormGroup,
  FormFeedback,
} from 'reactstrap';
import {
  faArrowUp,
  faArrowDown,
  faPencilAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import FBCheckbox from './checkbox/FBCheckbox';
import Collapse from './Collapse/Collapse';
import CardModal from './CardModal';
import { CardDefaultParameterInputs } from './defaults/defaultInputs';
import Tooltip from './Tooltip';
import Add from './Add';
import Card from './Card';
import {
  checkForUnsupportedFeatures,
  generateElementComponentsFromSchemas,
  countElementsFromSchema,
  addCardObj,
  addSectionObj,
  onDragEnd,
  DROPPABLE_TYPE,
} from './utils';
import FontAwesomeIcon from './FontAwesomeIcon';
import { getRandomId } from './utils';
import type { SectionPropsType } from './types';

const useStyles = createUseStyles({
  sectionContainer: {
    '& .section-head': {
      display: 'flex',
      borderBottom: '1px solid gray',
      margin: '0.5em 1.5em 0 1.5em',
      '& h5': {
        color: 'black',
        fontSize: '14px',
        fontWeight: 'bold',
      },
      '& .section-entry': {
        width: '33%',
        textAlign: 'left',
        padding: '0.5em',
      },
      '& .section-reference': { width: '100%' },
    },
    '& .section-footer': {
      marginTop: '1em',
      textAlign: 'center',
      '& .fa': { cursor: 'pointer' },
    },
    '& .section-interactions': {
      margin: '0.5em 1.5em',
      textAlign: 'left',
      borderTop: '1px solid gray',
      paddingTop: '1em',
      '& .fa': {
        marginRight: '1em',
        borderRadius: '4px',
        padding: '0.25em',
        height: '25px',
        width: '25px',
      },
      '& .fa-pencil-alt, &.fa-pencil, & .fa-arrow-up, & .fa-arrow-down': {
        border: '1px solid #1d71ad',
        color: '#1d71ad',
      },
      '& .fa-trash': { border: '1px solid #de5354', color: '#de5354' },
      '& .fa-arrow-up, & .fa-arrow-down': { marginRight: '0.5em' },
      '& .fb-checkbox': {
        display: 'inline-block',
        label: { color: '#9aa4ab' },
      },
      '& .interactions-left, & .interactions-right': {
        display: 'inline-block',
        width: '48%',
        margin: '0 auto',
      },
      '& .interactions-left': { textAlign: 'left' },
      '& .interactions-right': { textAlign: 'right' },
    },
  },
});

export default function Section({
  name,
  required,
  schema,
  uischema,
  onChange,
  // onNameChange,
  onRequireToggle,
  onDependentsChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSave,
  path,
  definitionData,
  definitionUi,
  hideKey, // eslint-disable-line @typescript-eslint/no-unused-vars
  reference,
  dependents,
  dependent,
  parent,
  parentProperties,
  neighborNames,
  cardOpen,
  setCardOpen,
  allFormInputs,
  mods,
  categoryHash,
}: SectionPropsType): ReactElement {
  const classes = useStyles();
  const unsupportedFeatures = checkForUnsupportedFeatures(
    schema || {},
    uischema || {},
    allFormInputs,
  );
  const schemaData = schema || {};
  const elementNum = countElementsFromSchema(schemaData);
  const defaultCollapseStates = [...Array(elementNum)].map(() => false);
  const [cardOpenArray, setCardOpenArray] = React.useState(
    defaultCollapseStates,
  );
  // keep name in state to avoid losing focus
  const [keyName, setKeyName] = React.useState(name);
  const [keyError, setKeyError] = React.useState<null | string>(null);
  const [titleState, setTitleState] = React.useState(schemaData.title || '');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [elementId] = React.useState(getRandomId());
  // Function to convert display name to camelCase for object name
  const toCamelCase = (str: string): string => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters
  };
  const addProperties = {
    schema,
    uischema,
    mods,
    onChange,
    definitionData,
    definitionUi,
    categoryHash,
  };
  const hideAddButton =
    schemaData.properties && Object.keys(schemaData.properties).length !== 0;

  useEffect(() => {
    if (schema?.title && schema.title !== titleState) {
      setTitleState(schema.title);
    }
  }, [schema.title]);

  const handleChange = useCallback(
    (ev: any) => {
      const newTitle = ev.target.value;
      setTitleState(newTitle);

      // Auto-generate camelCase object name from title
      const newObjectName = toCamelCase(newTitle);

      // Check if the new object name conflicts with existing names
      let uniqueName = newObjectName;
      console.log('uniqueName', newTitle, uniqueName);
      if (
        neighborNames &&
        neighborNames.includes(newObjectName) &&
        newObjectName !== name
      ) {
        let counter = 1;
        while (neighborNames.includes(`${newObjectName}${counter}`)) {
          counter++;
        }
        uniqueName = `${newObjectName}${counter}`;
      }
      setKeyName(uniqueName);
      setKeyError(null);
    },
    [neighborNames, name, toCamelCase],
  );

  const handleBlur = useCallback(() => {
    onChange(
      {
        ...schema,
        title: titleState,
        // name: keyName,
      },
      uischema,
    );
  }, [schema, uischema, titleState, keyName, onChange]);

  return (
    <React.Fragment>
      <Collapse
        isOpen={cardOpen}
        toggleCollapse={() => setCardOpen(!cardOpen)}
        title={
          <React.Fragment>
            <span onClick={() => setCardOpen(!cardOpen)} className='label'>
              {schemaData.title || keyName}{' '}
              {parent ? (
                <Tooltip
                  text={`Depends on ${parent}`}
                  id={`${elementId}_parentinfo`}
                  type='alert'
                />
              ) : (
                ''
              )}
            </span>
            <span className='arrows'>
              <span id={`${elementId}_moveupbiginfo`}>
                <FontAwesomeIcon
                  icon={faArrowUp}
                  onClick={() => (onMoveUp ? onMoveUp() : {})}
                />
              </span>
              <UncontrolledTooltip
                placement='top'
                target={`${elementId}_moveupbiginfo`}
              >
                Move up
              </UncontrolledTooltip>
              <span id={`${elementId}_movedownbiginfo`}>
                <FontAwesomeIcon
                  icon={faArrowDown}
                  onClick={() => (onMoveDown ? onMoveDown() : {})}
                />
              </span>
              <UncontrolledTooltip
                placement='top'
                target={`${elementId}_movedownbiginfo`}
              >
                Move down
              </UncontrolledTooltip>
            </span>
          </React.Fragment>
        }
        className={`section-container ${classes.sectionContainer} ${
          dependent ? 'section-dependent' : ''
        } ${reference ? 'section-reference' : ''}`}
      >
        <div
          className={`section-entries ${reference ? 'section-reference' : ''}`}
        >
          <div className='section-head'>
            {reference ? (
              <div className='section-entry section-reference'>
                <h5>Reference Section</h5>
                <Select
                  value={{
                    value: reference,
                    label: reference,
                  }}
                  placeholder='Reference'
                  options={Object.keys(definitionData).map((key) => ({
                    value: `#/definitions/${key}`,
                    label: `#/definitions/${key}`,
                  }))}
                  onChange={(val: any) => {
                    onChange(schema, uischema, val.value);
                  }}
                  className='section-select'
                />
              </div>
            ) : (
              ''
            )}
            <div className='section-entry' data-test='section-object-name'>
              <h5>
                Section Object Name{' '}
                <Tooltip
                  text={
                    mods &&
                    mods.tooltipDescriptions &&
                    mods.tooltipDescriptions &&
                    typeof mods.tooltipDescriptions.cardSectionObjectName ===
                      'string'
                      ? mods.tooltipDescriptions.cardSectionObjectName
                      : 'The key to the object that will represent this form section.'
                  }
                  id={`${elementId}_nameinfo`}
                  type='help'
                />
              </h5>
              <FormGroup>
                <Input
                  disabled={true}
                  value={keyName || ''}
                  placeholder='Section Display Name'
                  type='text'
                  className='card-text'
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                />
                {keyError && <FormFeedback>{keyError}</FormFeedback>}
              </FormGroup>
            </div>
            <div className='section-entry' data-test='section-display-name'>
              <h5>
                Section Display Name{' '}
                <Tooltip
                  text={
                    mods &&
                    mods.tooltipDescriptions &&
                    mods.tooltipDescriptions &&
                    typeof mods.tooltipDescriptions.cardSectionDisplayName ===
                      'string'
                      ? mods.tooltipDescriptions.cardSectionDisplayName
                      : 'The name of the form section that will be shown to users of the form.'
                  }
                  id={`${elementId}_titleinfo`}
                  type='help'
                />
              </h5>
              <Input
                value={titleState}
                placeholder='Title'
                type='text'
                onChange={handleChange}
                onBlur={handleBlur}
                className='card-text'
              />
            </div>
            <div className='section-entry' data-test='section-description'>
              <h5>
                Section Description{' '}
                <Tooltip
                  text={
                    mods &&
                    mods.tooltipDescriptions &&
                    mods.tooltipDescriptions &&
                    typeof mods.tooltipDescriptions.cardSectionDescription ===
                      'string'
                      ? mods.tooltipDescriptions.cardSectionDescription
                      : 'A description of the section which will be visible on the form.'
                  }
                  id={`${elementId}_descriptioninfo`}
                  type='help'
                />
              </h5>
              <Input
                value={schemaData.description || ''}
                placeholder='Description'
                type='text'
                onChange={(ev) =>
                  onChange(
                    {
                      ...schema,
                      description: ev.target.value,
                    },
                    uischema,
                  )
                }
                className='card-text'
              />
            </div>
            <Alert
              style={{
                display: unsupportedFeatures.length === 0 ? 'none' : 'block',
              }}
              color='warning'
            >
              <h5>Unsupported Features:</h5>
              {unsupportedFeatures.map((message) => (
                <li key={`${elementId}_${message}`}>{message}</li>
              ))}
            </Alert>
          </div>
          <div className='section-body'>
            <DragDropContext
              onDragEnd={(result) =>
                onDragEnd(result, {
                  schema,
                  uischema,
                  onChange,
                  definitionData,
                  definitionUi,
                  categoryHash,
                })
              }
            >
              <Droppable droppableId='droppable' type={DROPPABLE_TYPE}>
                {(providedDroppable) => (
                  <div
                    ref={providedDroppable.innerRef}
                    {...providedDroppable.droppableProps}
                  >
                    {generateElementComponentsFromSchemas({
                      schemaData: schema,
                      uiSchemaData: uischema,
                      onChange,
                      onSave: onSave
                        ? (fieldData, schema, uischema) =>
                            onSave(
                              fieldData,
                              JSON.stringify(schema),
                              JSON.stringify(uischema),
                            )
                        : () => {},
                      path,
                      definitionData,
                      definitionUi,
                      cardOpenArray,
                      setCardOpenArray,
                      allFormInputs,
                      mods,
                      categoryHash,
                      Card,
                      Section,
                    }).map((element: any, index) => (
                      <Draggable
                        key={element.key}
                        draggableId={element.key}
                        index={index}
                      >
                        {(providedDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                          >
                            {element}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {providedDroppable.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className='section-footer'>
            {!hideAddButton &&
              mods?.components?.add &&
              mods.components.add(addProperties)}
            {!mods?.components?.add && (
              <Add
                tooltipDescription={
                  ((mods || {}).tooltipDescriptions || {}).add
                }
                addElem={(choice: string) => {
                  if (choice === 'card') {
                    addCardObj(addProperties);
                  } else if (choice === 'section') {
                    addSectionObj(addProperties);
                  }
                }}
                hidden={hideAddButton}
              />
            )}
          </div>
          <div className='section-interactions'>
            <span id={`${elementId}_editinfo`}>
              <FontAwesomeIcon
                icon={faPencilAlt}
                onClick={() => setModalOpen(true)}
              />
            </span>
            <UncontrolledTooltip
              placement='top'
              target={`${elementId}_editinfo`}
            >
              Additional configurations for this form element
            </UncontrolledTooltip>
            <span id={`${elementId}_trashinfo`}>
              <FontAwesomeIcon
                icon={faTrash}
                onClick={() => (onDelete ? onDelete() : {})}
              />
            </span>
            <UncontrolledTooltip
              placement='top'
              target={`${elementId}_trashinfo`}
            >
              Delete form element
            </UncontrolledTooltip>
            <FBCheckbox
              onChangeValue={() => onRequireToggle()}
              isChecked={required}
              label='Required'
              id={`${elementId}_required`}
            />
          </div>
        </div>
        <CardModal
          componentProps={{
            dependents,
            neighborNames,
            name: keyName,
            schema,
            type: 'object',
            'ui:column': uischema['ui:column'] ?? '',
            'ui:options': uischema['ui:options'] ?? '',
          }}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onChange={(newComponentProps: { [key: string]: any }) => {
            onDependentsChange(newComponentProps.dependents);
            onChange(schema, {
              ...uischema,
              'ui:column': newComponentProps['ui:column'],
            });
          }}
          TypeSpecificParameters={CardDefaultParameterInputs}
        />
      </Collapse>
      {mods?.components?.add && mods.components.add(parentProperties)}
      {!mods?.components?.add && (
        <Add
          tooltipDescription={((mods || {}).tooltipDescriptions || {}).add}
          addElem={(choice: string) => {
            if (choice === 'card') {
              addCardObj(parentProperties);
            } else if (choice === 'section') {
              addSectionObj(parentProperties);
            }
            setCardOpen(false);
          }}
        />
      )}
    </React.Fragment>
  );
}
