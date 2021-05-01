import {
  CHANGE_SELECTED_DB,
  CHANGE_SELECTED_DOC,
  CHANGE_REVISION_LIST,
  CHANGE_DISPLAY_DATA,
  CHANGE_REVISION_DATA,
  CHANGE_PREV_REVISION_DOC,
  CHANGE_LDR_DOC_A,
  CHANGE_LDR_DOC_B,
  CHANGE_REVISED_DOC,
} from '../actions'

const initialState = {
  selectedDb: '',
  selectedDoc: '',
  revisionList: [],
  displayData: {
    name: 'No Document Selected',
  },
  revisionData: {
    'No Revision Selected': 'Please select a revision.',
  },
  ldrDocA: {
    'Waiting to Load': 'Please select a conflict',
  },
  ldrDocB: {
    'Waiting to Load': 'Please select a conflict',
  },
  previousRevisionDoc: {
    'Waiting to Load': 'Please select a conflict',
  },
  revisedDoc: {
    'Waiting to Load': 'Waiting for doc to be merged',
  },
}

const ConflictReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_SELECTED_DB:
      return { ...state, selectedDb: action.selectedDb }
    case CHANGE_SELECTED_DOC:
      return { ...state, selectedDoc: action.selectedDoc }
    case CHANGE_REVISION_LIST:
      return { ...state, revisionList: action.revisionList }
    case CHANGE_DISPLAY_DATA:
      return { ...state, displayData: action.displayData }
    case CHANGE_REVISION_DATA:
      return { ...state, revisionData: action.revisionData }
    case CHANGE_PREV_REVISION_DOC:
      return {
        ...state,
        previousRevisionDoc: action.previousRevisionDoc,
        ldrDocsLoading: false,
      }
    case CHANGE_LDR_DOC_A:
      return {
        ...state,
        ldrDocA: action.ldrDocA,
        previousRevisionDoc: initialState.previousRevisionDoc,
      }
    case CHANGE_LDR_DOC_B:
      return { ...state, ldrDocB: action.ldrDocB }
    case CHANGE_REVISED_DOC:
      return { ...state, revisedDoc: action.revisedDoc }
    default:
      return state
  }
}

export const getSelectedDb = (state) => state.conflict.selectedDb
export const getSelectedDoc = (state) => state.conflict.selectedDoc
export const getRevisionList = (state) => state.conflict.revisionList
export const getDisplayData = (state) => state.conflict.displayData
export const getRevisionData = (state) => state.conflict.revisionData
export const getPreviousRevisionDoc = (state) => state.conflict.previousRevisionDoc
export const getLdrDocA = (state) => state.conflict.ldrDocA
export const getLdrDocB = (state) => state.conflict.ldrDocB
export const getRevisedDoc = (state) => state.conflict.revisedDoc

export default ConflictReducer
