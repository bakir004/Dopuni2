import Router from "./components/router";
import { FunctionComponent } from "react";

interface AppProps {}

const App: FunctionComponent<AppProps> = () => {
  return (
    <div className="font-display">
      <Router></Router>
    </div>
  );
};

export default App;
