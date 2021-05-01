/*
   list of all document revisions
*/
import React, { Component } from 'react' // react rendering
import PropTypes from 'prop-types' // react prop typechecking
import '../styles/graphStyles.css' // CSS stles for the graph

class DocList extends Component {
  visualizeData(db, id, winningRev, losingRevs) {
    const {
      changeSelectedDb,
      changeSelectedDoc,
      changeRevisionList,
      changeDisplayData,
      fetchRevisionA,
      fetchRevisionB,
      fetchPrevRevisionDoc,
      changeRevisedDoc,
    } = this.props

    const docHistory = {
      name: id,
      children: [
        {
          name: winningRev,
        },
        {
          name: losingRevs[0],
        },
      ],
    }

    const allRevisions = [...losingRevs, winningRev]
    changeRevisionList(allRevisions)
    changeRevisedDoc()
    changeSelectedDb(db)
    changeSelectedDoc(id)
    fetchPrevRevisionDoc(db, id, allRevisions);
    changeDisplayData(docHistory)
    fetchRevisionA(db, id, allRevisions);
    fetchRevisionB(db, id, allRevisions);
  }

  render() {
    const { nodes } = this.props
    const conflicts = (nodes[0]
      && nodes[0].conflicts.rows.filter((db) => db.numConflicts > 0)) || []

    return (
      <div
        style={{
          title: 'Select a Conflict: ',
          overflow: 'scroll',
          width: '100%',
        }}
      >
        <ul>
          {conflicts.map((db) => (
            <li
              className="no-clickable"
              key={db}
            >
              {`db: ${db.dbName}` }
              <ul>
                {db.conflictsList.map((doc) => (
                  // eslint-disable-next-line
                  <li
                    className="clickable"
                    onClick={() => this.visualizeData(
                      db.dbName,
                      doc.id,
                      doc.value.winningRev,
                      doc.value.losingRevs,
                    )}
                    key={doc.id}
                  >
                    { `id: ${doc.id}, versions: ${doc.value.losingRevs.length + 1}` }
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

DocList.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      node_name: PropTypes.string,
      conflicts: PropTypes.shape({
        total: PropTypes.number,
        rows: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
  ).isRequired,
  changeRevisionList: PropTypes.func.isRequired,
  changeSelectedDb: PropTypes.func.isRequired,
  changeDisplayData: PropTypes.func.isRequired,
  changeSelectedDoc: PropTypes.func.isRequired,
  fetchRevisionA: PropTypes.func.isRequired,
  fetchRevisionB: PropTypes.func.isRequired,
  fetchPrevRevisionDoc: PropTypes.func.isRequired,
  changeRevisedDoc: PropTypes.func.isRequired,
}

export default DocList
