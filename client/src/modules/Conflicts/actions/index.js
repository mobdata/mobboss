import callApi from '../../../util/apiCaller'

export const CHANGE_SELECTED_DB = 'CHANGE_SELECTED_DB'
export const CHANGE_SELECTED_DOC = 'CHANGE_SELECTED_DOC'
export const CHANGE_REVISION_LIST = 'CHANGE_REVISION_LIST'
export const CHANGE_DISPLAY_DATA = 'CHANGE_DISPLAY_DATA'
export const CHANGE_REVISION_DATA = 'CHANGE_REVISION_DATA'
export const CHANGE_PREV_REVISION_DOC = 'CHANGE_PREV_REVISION_DOC'
export const CHANGE_LDR_DOC_A = 'CHANGE_LDR_DOC_A'
export const CHANGE_LDR_DOC_B = 'CHANGE_LDR_DOC_B'
export const CHANGE_REVISED_DOC = 'CHANGE_REVISED_DOC'

export function changeSelectedDb(selectedDb) {
  return {
    type: CHANGE_SELECTED_DB,
    selectedDb,
  }
}

export function changeSelectedDoc(selectedDoc) {
  return {
    type: CHANGE_SELECTED_DOC,
    selectedDoc,
  }
}

export function changeRevisionList(revisionList) {
  return {
    type: CHANGE_REVISION_LIST,
    revisionList,
  }
}

export function changeDisplayData(displayData) {
  return {
    type: CHANGE_DISPLAY_DATA,
    displayData,
  }
}

export function changeRevisionData(revisionData) {
  return {
    type: CHANGE_REVISION_DATA,
    revisionData,
  }
}

export function changePrevRevisionDoc(previousRevisionDoc) {
  return {
    type: CHANGE_PREV_REVISION_DOC,
    previousRevisionDoc,
  }
}

export function changeLdrDocA(ldrDocA) {
  return {
    type: CHANGE_LDR_DOC_A,
    ldrDocA,
  }
}

export function changeLdrDocB(ldrDocB) {
  return {
    type: CHANGE_LDR_DOC_B,
    ldrDocB,
  }
}

export function changeRevisedDoc(revisedDoc) {
  return {
    type: CHANGE_REVISED_DOC,
    revisedDoc,
  }
}

export function fetchRevisionData(selectedDb, selectedDoc, revision) {
  return async (dispatch) => {
    callApi(`docs/${selectedDb}/${selectedDoc}/${revision}`)
      .then((res) => dispatch(changeRevisionData(res.json)))
  }
}

export function fetchRevisionDocForMerge(selectedDb, selectedDoc, revisionId, displayDoc) {
  return async (dispatch) => {
    callApi(`docs/${selectedDb}/${selectedDoc}/${revisionId}`)
      .then((res) => ((displayDoc === 'A') ? dispatch(changeLdrDocA(res.json)) : dispatch(changeLdrDocB(res.json))))
  }
}

export function fetchPreviousRevisionDoc(selectedDb, selectedDoc, docARevId) {
  let prevRevIndex = 1;
  const docARevIdNumber =  docARevId.split('-')[0];
  return async (dispatch) => {
    callApi(`docs/${selectedDb}/${selectedDoc}?revs_info=true`)
      .then((res) => {
        if (Object.prototype.hasOwnProperty.call(res.json, '_revs_info')) {
          // if (res.json.hasOwnProperty('_revs_info')) {
          let prevRevision = res.json._revs_info[prevRevIndex];
          let prevRevisionIdNumber = prevRevision.rev.split('-')[0];
          // While the next version is not available OR if the prevRev is not
          // actually older than docA, then get the next one.
          while ((prevRevision.status !== 'available'
            || prevRevisionIdNumber >= docARevIdNumber)
            && prevRevIndex < res.json._revs_info.length - 1) {
            prevRevIndex += 1;
            if (res.json._revs_info[prevRevIndex]) {
              prevRevision = res.json._revs_info[prevRevIndex];
              [prevRevisionIdNumber] = prevRevision.rev.split('-');
            }
          }
          if (prevRevIndex === res.json._revs_info.length - 1) {
            // no previous revision is available at all.
            // So, dispatch changePrevRevDoc with no longer available text to display in mergePanels
            dispatch(
              changePrevRevisionDoc(
                {
                  Error: '  This revision is no longer available in the database.'
                  + ' You can still merge by clicking on data from both sides. ',
                },
              ),
            )
          } else {
            const id = prevRevision.rev;
            callApi(`docs/${selectedDb}/${selectedDoc}/${id}`)
              .then((response) => dispatch(changePrevRevisionDoc(response.json)))
          }
        }
      })
  }
}

export function pushWinningRevision(db, id, revisionData, revisionList, docARev, docBRev) {
  const docsUpdateAndDeleteArray = [];
  let deleteRev;
  const revisedDocument = revisionData;

  if (JSON.stringify(revisedDocument) === JSON.stringify(docARev)) {
    // just accepting docA. Delete B
    deleteRev = docBRev._rev;
  } else if (JSON.stringify(revisedDocument) === JSON.stringify(docBRev)) {
    // just accepting docB. Delete A
    deleteRev = docARev._rev;
  } else {
    // we use docB's rev here bc docB is always the server selected doc anyway
    // Since this was a merge now, also update the updated_on date.
    revisedDocument._rev = docBRev._rev;
    revisedDocument.updated_on = new Date();
    deleteRev = docARev._rev;
    docsUpdateAndDeleteArray.push(revisedDocument);
  }

  const revToDelete = { _id: id, _rev: deleteRev, _deleted: true };
  docsUpdateAndDeleteArray.push(revToDelete);

  return async () => {
    // eslint-disable-next-line
    if (window.confirm(
      'Are you sure you want to push the selected revision? All other revisions will be deleted.',
    )) {
      // eslint-disable-next-line
      callApi(`${db}/_bulk_docs`,
        'POST',
        { docs: docsUpdateAndDeleteArray })
        .then(() => window.location.reload())
    }
  }
}
