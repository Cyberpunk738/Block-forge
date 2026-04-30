// Initialize block registry (must run before any rendering)
import './components/blocks';

import Toolbar from './components/Toolbar';
import Editor from './components/Editor';

/**
 * App — Root shell for BlockForge.
 * Composes the toolbar and editor into the main layout.
 */
const App = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Toolbar />
      <Editor />
    </div>
  );
};

export default App;
