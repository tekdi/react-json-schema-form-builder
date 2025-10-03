import React, { ReactElement } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { createUseStyles } from 'react-jss';
import {
  faArrowUp,
  faArrowDown,
  faPencilAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import FBCheckbox from './checkbox/FBCheckbox';
import Collapse from './Collapse/Collapse';
import CardModal from './CardModal';
import CardGeneralParameterInputs from './CardGeneralParameterInputs';
import Add from './Add';
import FontAwesomeIcon from './FontAwesomeIcon';
import Tooltip from './Tooltip';
import { getRandomId } from './utils';
import type { CardPropsType, CardComponentPropsType } from './types';

const useStyles = createUseStyles({
  cardEntries: {
    'border-bottom': '1px solid gray',
    margin: '.5em 1.5em 0 1.5em',
    '& h5': {
      color: 'black',
      'font-size': '14px',
      'font-weight': 'bold',
    },
    '& .card-entry-row': {
      display: 'flex',
    },
    '& .card-entry': {
      margin: 0,
      width: '50%',
      'text-align': 'left',
      padding: '0.5em',
      '&.wide-card-entry': {
        width: '100%',
      },
    },
    '& input': {
      border: '1px solid gray',
      'border-radius': '4px',
    },
    '& .card-category-options': {
      padding: '.5em',
    },
    '& .card-select': {
      border: '1px solid gray',
      'border-radius': '4px',
    },
    '& .card-array': {
      '& .fa-plus-square, & .fa-square-plus': { display: 'none' },
      '& .section-entries': {
        '& .fa-plus-square, & .fa-square-plus': { display: 'initial' },
      },
    },
    '& .card-enum': {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: 'lightGray',
      textAlign: 'left',
      padding: '1em',
      '& h3': { fontSize: '16px', margin: '0 0 .5em 0' },
      '& label': { color: 'black', fontSize: '14px' },
      '& .card-enum-header': {
        marginTop: '0.5em',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        '& h5': { width: '50%', fontWeight: 'bold', fontSize: '14px' },
      },
      '& .fa': { cursor: 'pointer' },
    },
  },
  cardInteractions: {
    margin: '.5em 1.5em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .fa': {
      marginRight: '1em',
      borderRadius: '4px',
      padding: '.25em',
      height: '25px',
      width: '25px',
    },
    '& .fa-arrow-up, .fa-arrow-down': { marginRight: '.5em' },
    '& .fa-trash': { border: '1px solid #DE5354', color: '#DE5354' },
    '& .fb-checkbox': { display: 'inline-block' },
    '& .interactions-left': {
      display: 'flex',
      alignItems: 'center',
      gap: '1em',
    },
    '& .interactions-right': {
      display: 'flex',
      alignItems: 'center',
      gap: '1em',
    },
    '& .save-button': {
      backgroundColor: '#007D80',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '4px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: '#005f62',
      },
      '&:focus': {
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(0, 125, 128, 0.3)',
      },
    },
    '& .custom-save-btn': {
      backgroundColor: '#007D80 !important',
      color: 'white !important',
      border: 'none !important',
      borderRadius: '50px !important',
      padding: '4px 12px !important',
      cursor: 'pointer !important',
      fontSize: '14px !important',
      fontWeight: 'bold !important',
      boxShadow: 'none !important',
      outline: 'none !important',
      '&:hover': {
        backgroundColor: '#005f62 !important',
      },
      '&:focus': {
        outline: 'none !important',
        boxShadow: '0 0 0 2px rgba(0, 125, 128, 0.3) !important',
      },
    },
  },
});

export default function Card({
  componentProps,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSave,
  TypeSpecificParameters,
  addElem,
  cardOpen,
  setCardOpen,
  allFormInputs,
  mods,
  showObjectNameInput = true,
  addProperties,
}: CardPropsType): ReactElement {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [elementId] = React.useState(getRandomId());

  return (
    <React.Fragment>
      <Collapse
        isOpen={cardOpen}
        toggleCollapse={() => setCardOpen(!cardOpen)}
        title={
          <React.Fragment>
            <span onClick={() => setCardOpen(!cardOpen)} className='label'>
              {componentProps.title || componentProps.name}{' '}
              {componentProps.parent ? (
                <Tooltip
                  text={`Depends on ${componentProps.parent}`}
                  id={`${elementId}_parentinfo`}
                  type='alert'
                />
              ) : (
                ''
              )}
              {componentProps.$ref !== undefined ? (
                <Tooltip
                  text={`Is an instance of pre-configured component ${componentProps.$ref}`}
                  id={`${elementId}_refinfo`}
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
        className={`card-container ${
          componentProps.dependent ? 'card-dependent' : ''
        } ${componentProps.$ref === undefined ? '' : 'card-reference'}`}
      >
        <div className={classes.cardEntries}>
          <CardGeneralParameterInputs
            parameters={componentProps}
            onChange={onChange}
            allFormInputs={allFormInputs}
            mods={mods}
            showObjectNameInput={showObjectNameInput}
          />
        </div>
        <div className={classes.cardInteractions}>
          <div className='interactions-left'>
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
                onClick={() => onDelete && onDelete()}
              />
            </span>
            <UncontrolledTooltip
              placement='top'
              target={`${elementId}_trashinfo`}
            >
              Delete form element
            </UncontrolledTooltip>
            <FBCheckbox
              onChangeValue={() =>
                onChange({
                  ...componentProps,
                  required: !componentProps.required,
                })
              }
              isChecked={!!componentProps.required}
              label='Required'
              id={`${elementId}_required`}
            />
          </div>
          <div className='interactions-right'>
            <button
              className='save-button custom-save-btn'
              style={{
                backgroundColor: '#007D80',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: 'none',
                outline: 'none',
              }}
              onClick={() => {
                try {
                  if (onSave) {
                    onSave();
                  } else {
                    console.log(
                      'onSave function not available - onSave is:',
                      onSave,
                    );
                  }
                } catch (error) {
                  console.error('Error calling onSave:', error);
                }
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  '#005f62';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  '#007D80';
              }}
              type='button'
            >
              Save
            </button>
          </div>
        </div>
        <CardModal
          componentProps={componentProps as CardComponentPropsType}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onChange={(newComponentProps: CardComponentPropsType) => {
            onChange(newComponentProps);
          }}
          TypeSpecificParameters={TypeSpecificParameters}
        />
      </Collapse>
      {mods?.components?.add && mods?.components?.add(addProperties)}
      {!mods?.components?.add && addElem && (
        <Add
          tooltipDescription={((mods || {}).tooltipDescriptions || {}).add}
          addElem={(choice: string) => addElem(choice)}
        />
      )}
    </React.Fragment>
  );
}
