import { makeStyles } from '@material-ui/core/styles';
import { IEditorStyles } from 'react-simple-wysiwyg';
import { danger, success } from '../config/theme';

const useEditorStyles = makeStyles({
  subtitle: {
    marginBottom: '24px',
  },
  listItem: {
    padding: '20px',
  },
  counter: {
    marginLeft: '8px',
  },
  grow: {
    flexGrow: 1,
  },
  paginationContainer: {
    paddingTop: '18px',
  },
  loadingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  relative: {
    position: 'relative',
  },
  inputLabelShrunk: {
    marginLeft: 8,
    fontSize: 24,
    fontWeight: 500,
    marginBottom: 8,
  },
  editorButton: {
    minWidth: 80,
    // marginLeft: 12
  },
  tagChip: {
    marginRight: 8,
  },
  tagChipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  dangerButton: {
    backgroundColor: danger,
  },
  speedDial: {
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
      bottom: 16,
      right: 16,
    },
  },
  fab: {
    position: 'fixed',
    bottom: 32,
    right: 32,
  },
  successIcon: {
    width: '60%',
    height: '60%',
    color: success,
    margin: '20%',
  },
  panelInterval: {
    marginTop: '30px',
  },
  panelGroup: {
    marginTop: '30px',
    border: 'dotted #7a7979 1px',
  },
  border: {
    borderBottom:'dotted #7a7979 1px',
  },
  noMargin: {
    marginTop:'0',
  },
  cellInterval: {
    marginTop: '20px',
    paddingLeft: '20px',
  },
  buttonPadding: {
    marginLeft: '10px',
  },
  contentEditable: {
    background: '#fff',
    color: 'black',
  },
});

export default useEditorStyles;

export const editorStyles: IEditorStyles = {
  contentEditable: {
    background: '#fff',
    color: 'black',
  },
};
